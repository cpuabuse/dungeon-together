/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Modules.
 *
 * @file
 */

import { EntityKindClass } from "../app/server/entity";
import { ServerUniverse } from "../app/server/universe";

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
type ModuleList = Record<string, Module>;

/**
 * Empty module list, for constraints.
 */
type EmptyModuleList = Record<never, Module>;

/**
 * Aggregated arguments of module factories.
 *
 * @remarks
 * With generics provided, this is type.
 * Without generics provided, this is a loose constraint.
 */
type ModuleFactoryRecord<Local extends ModuleList = any, Global extends ModuleList = any> = {
	/**
	 * Global module name.
	 */
	name: string;

	/**
	 * Factory dependencies.
	 */
	depends: {
		// Value is such a key of global, where local value extends global value
		[K in keyof Local]: keyof {
			[G in keyof Global]: Local[K] extends Global[G] ? G : never;
		};
	};

	/**
	 * Factory.
	 */
	factory: (...args: ModuleFactoryParams<Local>) => Module;
};

/**
 * Tuple of module entries.
 */
type ModuleFactoryRecordList = readonly ModuleFactoryRecord[];

/**
 * Aggregates a global module list.
 */
type ToGlobal<List, Name extends string> = List extends readonly [infer E, ...infer R]
	? E extends ModuleFactoryRecord
		? Name extends E["name"]
			? EmptyModuleList
			: R extends ModuleFactoryRecordList
			? ToGlobal<R, Name> & {
					[key in E["name"]]: ReturnType<E["factory"]>;
			  }
			: never
		: never
	: never;

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
 */
export type ModuleFactoryRecordListConstraint<T> = {
	[K in keyof T]: T[K] extends ModuleFactoryRecord
		? T[K] extends ModuleFactoryRecord<Parameters<T[K]["factory"]>[0]["modules"], ToGlobal<T, T[K]["name"]>>
			? T[K]
			: never
		: never;
};
