/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { CoreArg, CoreArgIds, CoreArgObjectWords, coreArgIdToPathUuidPropertyName, coreArgObjectWords } from "../arg";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectContainerFactory } from ".";

/**
 * Own instance of a universe object, that has to be implemented within {@link CoreUniverseObjectContainerFactory}.
 */
type CoreUniverseObjectInjectionInstance<I extends CoreArgIds, O extends CoreUniverseObjectArgsOptionsUnion> = {
	[K in typeof coreArgObjectWords[I]["singularCapitalizedWord"] as `terminate${K}`]: (
		this: CoreUniverseObjectInjectionInstance<I, O>
	) => void;
} & CoreArg<I, O>;

/**
 * Universe object instance minimal constraint.
 */
export type CoreUniverseObject<
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion
> = CoreUniverseObjectInjectionInstance<I, O>;

/**
 * Factory for core universe object class.
 *
 * @returns - Core universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectFactory<
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	C extends new (...args: any[]) => {},
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	// "N" for "contains"
	N extends CoreUniverseObject<D, O> = never,
	D extends CoreArgIds = never
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
	/**
	 * Is a container or not.
	 */
	type IsContainer = D extends never ? false : true;

	// Inferring for final type
	const parentWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[I]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[I]["singularCapitalizedWord"];
	} = coreArgObjectWords[universeObjectId];

	// Inferring for final type
	const childWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[D]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[D]["singularCapitalizedWord"];
	} = coreArgObjectWords[childUniverseObjectId];

	/**
	 * Name of remove universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameParentTerminateUniverseObject = `terminate${parentWords.singularCapitalizedWord}` as const;

	/**
	 * Name of universe object UUID.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameParentUniverseObjectUuid = coreArgIdToPathUuidPropertyName({ universeObjectId });

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
	 * Type of the container class, no matter if it's a container or not.
	 */
	type ContainerClass = Exclude<typeof containerBase, null>;

	/**
	 * Instance type of universe object.
	 */
	type ThisInstance = CoreUniverseObjectInjectionInstance<I, O> & UniverseObject;

	/**
	 * Abstract instance type.
	 * Since there are no abstract methods, this is the same as the instance type.
	 */
	type AbstractInstance = ThisInstance;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParameters = [CoreArg<I, O>, ...any[]];

	/**
	 * Return class type.
	 */
	type ReturnClass = AbstractInstance extends CoreArg<I, O>
		? // Injection
		  (abstract new (...args: ConstructorParameters) => CoreUniverseObjectInjectionInstance<I, O>) &
				// Base class
				(IsContainer extends true ? ContainerClass : typeof UniverseObject)
		: never;

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
	abstract class UniverseObject extends newBase {
		/**
		 * Public constructor.
		 *
		 * @param args - Mixin args
		 *
		 * @remarks
		 * When assigning to members, value is cast for extra type safety.
		 */
		public constructor(...args: any[]) {
			const arg: CoreArg<I, O> = (args as ConstructorParameters)[0];

			// Call super constructor
			super(args);

			// Assign UUID
			// Can't cast to `this` directly
			//
			(this as Record<string, unknown>)[nameParentUniverseObjectUuid] = arg[
				nameParentUniverseObjectUuid
			] as ThisInstance[typeof nameParentUniverseObjectUuid];
		}
	}

	// Set prototype
	(UniverseObject.prototype as Record<string, unknown>)[nameParentTerminateUniverseObject] =
		childUniverseObjectId === null
			? function (this: ThisInstance): void {
					// Nothing, debug info can be added later
			  }
			: function (this: ThisInstance): void {
					(this as ContainerInstance)[nameParentUniverseObjects].forEach(universeObject => {
						universeObject[nameChildTerminateUniverseObject]();
					});
			  };

	// Return
	// Conditionally checking if class is appropriately extending arg container to make sure injected class type is properly implemented
	return UniverseObject as ReturnClass;
}
