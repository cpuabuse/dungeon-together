/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { Uuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgPathUuidPropertyName,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectContainerFactory } from ".";

/**
 * Names used to access members.
 */
type Names<I extends CoreArgIds> = {
	/**
	 * Terminate universe object function.
	 */
	terminateUniverseObject: `terminate${CoreArgObjectWords[I]["singularCapitalizedWord"]}`;

	/**
	 * Universe object path.
	 */
	universeObjectUuid: CoreArgPathUuidPropertyName<I>;
};

/**
 * Type to be used to declare member vars.
 */
type ConstMembers<I extends CoreArgIds, O extends CoreUniverseObjectArgsOptionsUnion> = {
	/**
	 * Generate in constructor.
	 */
	generate: {
		/**
		 * Terminate function.
		 */
		terminateUniverseObject: {
			/**
			 * Terminate function name.
			 */
			name: Names<I>["terminateUniverseObject"];

			/**
			 * Terminate function body.
			 */
			value: (arg: CoreArg<I, O>) => (this: CoreUniverseObjectInjectionInstance<I, O>) => void;
		};

		/**
		 * Path property.
		 */
		universeObjectUuid: {
			/**
			 * Path property name.
			 */
			name: Names<I>["universeObjectUuid"];

			/**
			 * Path property value.
			 */
			value: (arg: CoreArg<I, O>) => Uuid;
		};
	};
};

/**
 * Types for members of instance.
 */
type Members<I extends CoreArgIds, O extends CoreUniverseObjectArgsOptionsUnion> = {
	[K in keyof ConstMembers<I, O>["generate"]]: ReturnType<ConstMembers<I, O>["generate"][K]["value"]>;
};

/**
 * Own instance of a universe object, that has to be implemented within {@link CoreUniverseObjectContainerFactory}.
 *
 * @remarks
 * Types extracted from a type which is verified within factory.
 */
type CoreUniverseObjectInjectionInstance<
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	// A variable; Do not use
	N extends Names<I> = Names<I>,
	// A variable; Do not use
	M extends Members<I, O> = Members<I, O>
> = {
	[K in N["terminateUniverseObject"] as K]: M["terminateUniverseObject"];
} & {
	[K in N["universeObjectUuid"] as K]: M["universeObjectUuid"];
};

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
	 * Parameter for member generation function.
	 */
	type MemberGenerateParameter = CoreArg<I, O>;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParameters = [MemberGenerateParameter, ...any[]];

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
	 * Members to work on to initialize instance.
	 */
	const members: ConstMembers<I, O> = {
		generate: {
			terminateUniverseObject: {
				name: nameParentTerminateUniverseObject,
				/**
				 * Terminate universe object function.
				 *
				 * @returns Terminate universe object function
				 */
				value: () =>
					childUniverseObjectId === null
						? function (this: ThisInstance): void {
								// Nothing, debug info can be added later
						  }
						: function (this: ThisInstance): void {
								(this as ContainerInstance)[nameParentUniverseObjects].forEach(universeObject => {
									universeObject[nameChildTerminateUniverseObject]();
								});
						  }
			},
			universeObjectUuid: {
				name: nameParentUniverseObjectUuid,
				/**
				 *	Universe object UUID.
				 *
				 * @param arg - CoreArg given to constructor
				 * @returns UUID of the universe object
				 */
				value: (arg: MemberGenerateParameter) => {
					return arg[nameParentUniverseObjectUuid];
				}
			}
		}
	};

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

			// Assign properties
			Object.values(members.generate).forEach(property => {
				(this as Record<string, unknown>)[property.name] = property.value(arg);
			});
		}
	}

	// Return
	// Conditionally checking if class is appropriately extending arg container to make sure injected class type is properly implemented
	return UniverseObject as ReturnClass;
}
