/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Modules.
 *
 * @file
 */

import { EntityKindClass } from "./entity";
import { ServerUniverse } from "./universe";

/**
 * Module.
 */
type Module = {
	/**
	 * Kinds.
	 */
	kinds: {
		[key: string]: EntityKindClass;
	};
};

/**
 * List of identifiers to modules.
 */
export type ModuleList = Record<string, Module>;

/**
 * Empty module list, for constraints.
 */
type EmptyModuleList = Record<never, Module>;

/**
 * Aggregated arguments of module factories.
 *
 * @remarks
 * With generics provided, this is type.
 * Without generics provided, this is a loose constraint. `Local` is set to any, as it becomes the contravariant function parameter.
 */
export type ModuleFactoryRecord<Local extends ModuleList = any, Global extends ModuleList = ModuleList> = {
	/**
	 * Global module name.
	 */
	name: string;

	/**
	 * Factory dependencies.
	 */
	depends: {
		// Value is such a key of global, where local value extends global value; Extracted through value and not keys, as keys seem to extract `never` values too
		[K in keyof Local]: {
			[G in keyof Global]: Local[K] extends Global[G] ? G : never;
		}[keyof Global];
	};

	/**
	 * Factory.
	 */
	factory: (...args: ModuleFactoryParams<Local>) => Module;
};

/**
 * Tuple of module entries.
 */
export type ModuleFactoryRecordList = readonly ModuleFactoryRecord[];

/**
 * Aggregates a global module list.
 *
 * @remarks
 * Instead of `never`, `EmptyModuleList` is used, to ensure result is a record, and not never, which would result in false positives further down the line.
 */
type ToGlobal<List, Name extends string> = List extends readonly [infer E, ...infer R]
	? E extends ModuleFactoryRecord
		? Name extends E["name"]
			? EmptyModuleList
			: R extends ModuleFactoryRecordList
			? ToGlobal<R, Name> & {
					[key in E["name"]]: ReturnType<E["factory"]>;
			  }
			: EmptyModuleList
		: EmptyModuleList
	: EmptyModuleList;

/**
 * Parameters for module factory.
 */
// Most loose result to fit constraint, when intersected
// eslint-disable-next-line @typescript-eslint/ban-types
export type ModuleFactoryParams<Depends extends ModuleList = EmptyModuleList> = [
	param: {
		/**
		 * Modules factory takes.
		 */
		modules: Depends;

		/**
		 * Server universe.
		 */
		universe: ServerUniverse;

		/**
		 * Potential props.
		 */
		props?: Record<string, unknown>;
	}
];

/**
 * Constraint, producing self-dependent, ordered list of factory entries.
 *
 * @remarks
 * When defining value, should either be defined explicitly as a tuple type, or use `as const`.
 * Performs checks, that no identical names used.
 * Extra variable in "depends" is allowed, so that potentially a reference to depends could be reused while loading, and it will not impact final result, as if the extra data in depends is not required by factory, it should not be used, and if it is not present in global module list, undefined would be provided.
 */
export type ModuleFactoryRecordListConstraint<T> = {
	[K in keyof T]: T[K] extends ModuleFactoryRecord
		? T[K]["name"] extends {
				[O in keyof T]: K extends O ? never : T[O] extends ModuleFactoryRecord ? T[O]["name"] : never;
		  }[keyof T]
			? ["Type error", "Duplicate name", T[K]["name"]]
			: T[K] extends ModuleFactoryRecord<Parameters<T[K]["factory"]>[0]["modules"], ToGlobal<T, T[K]["name"]>>
			? T[K]
			: ["Type error", "Dependency is missing or of wrong type", Parameters<T[K]["factory"]>[0]["modules"]]
		: ["Type error", "Tuple element is not a module factory record"];
};
