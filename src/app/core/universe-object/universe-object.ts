/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { CoreArgs } from "../args/args";
import { CoreUniverseObjectWords, coreUniverseObjectWords } from "./words";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectContainerFactory, CoreUniverseObjectIds } from ".";

/**
 *
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectFactory<
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	C extends new (...args: any[]) => {},
	I extends CoreUniverseObjectIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	// "N" for "contains"
	N extends CoreUniverseObject<D, O> = never,
	D extends CoreUniverseObjectIds = never,
	// Do not use
	E extends N extends never ? false : true = N extends never ? false : true
>({
	Base,
	universeObjectId,
	// Potentially to be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	options,
	childUniverseObjectId
}: {
	/**
	 * Base class.
	 */
	Base: C;

	/**
	 * Universe object ID.
	 */
	universeObjectId: I;

	/**
	 * Args options.
	 */
	options: O;

	/**
	 * Whether this is a container or not.
	 */
	childUniverseObjectId: D extends never ? null : D;
}) {
	// Inferring for final type
	const parentWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreUniverseObjectWords[I]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreUniverseObjectWords[I]["singularCapitalizedWord"];
	} = coreUniverseObjectWords[universeObjectId];

	// Inferring for final type
	const childWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreUniverseObjectWords[D]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreUniverseObjectWords[D]["singularCapitalizedWord"];
	} = coreUniverseObjectWords[childUniverseObjectId];

	/**
	 * Name of remove universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameParentTerminateUniverseObject = `terminate${parentWords.singularCapitalizedWord}` as const;

	/**
	 * Name of universe objects member.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameParentUniverseObjects = `${parentWords.pluralLowercaseWord}` as const;

	/**
	 * Name of remove universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameChildTerminateUniverseObject = `terminate${childWords.singularCapitalizedWord}` as const;

	/**
	 * Union removes container base type information, so new base was split into two, including this.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const containerBase =
		childUniverseObjectId === null
			? null
			: CoreUniverseObjectContainerFactory<C, N, D, O>({
					Base,
					options,
					// Overriding conditional type - removing "null"
					universeObjectId: childUniverseObjectId as D
			  });

	/**
	 *
	 */
	type ContainerClass = Exclude<typeof containerBase, null>;

	/**
	 *
	 */
	type ReturnClass = CoreUniverseObjectClass<I, O> & (E extends true ? ContainerClass : typeof UniverseObject);

	/**
	 * This type, if container.
	 */
	type ContainerInstance = InstanceType<ContainerClass>;

	/**
	 * Overall base class to be used, with potentially lost type information.
	 */
	const newBase: C = containerBase === null ? Base : containerBase;

	/**
	 * Actual class for core universe object.
	 *
	 * @remarks
	 * Impossible to directly extend generic factory with unknown member names.
	 */
	abstract class UniverseObject extends newBase {}

	(UniverseObject.prototype as Record<string, unknown>)[nameParentTerminateUniverseObject] =
		childUniverseObjectId === null
			? function (this: UniverseObject): void {
					// Nothing, debug info can be added later
			  }
			: function (this: UniverseObject): void {
					(this as ContainerInstance)[nameParentUniverseObjects].forEach(universeObject => {
						universeObject[nameChildTerminateUniverseObject]();
					});
			  };

	// Return
	return UniverseObject as ReturnClass;
}

/**
 *
 */
export type CoreUniverseObjectClass<
	I extends CoreUniverseObjectIds,
	O extends CoreUniverseObjectArgsOptionsUnion
> = abstract new (...args: any[]) => CoreUniverseObjectOwnInstance<I, O>;

/**
 *
 */
export type CoreUniverseObjectOwnInstance<
	I extends CoreUniverseObjectIds,
	O extends CoreUniverseObjectArgsOptionsUnion
> = {
	[K in typeof coreUniverseObjectWords[I]["singularCapitalizedWord"] as `terminate${K}`]: (
		this: CoreUniverseObjectOwnInstance<I, O>
	) => void;
};

/**
 *
 */
export type CoreUniverseObject<
	I extends CoreUniverseObjectIds,
	O extends CoreUniverseObjectArgsOptionsUnion
> = CoreUniverseObjectOwnInstance<I, O> & CoreArgs<I, O>;
