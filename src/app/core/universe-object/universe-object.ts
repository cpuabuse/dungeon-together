/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { ComputedClassExtract } from "../../common/computed-class";
import { Uuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectContainerFactory } from ".";

// #region Members
/**
 * Type to be used to declare member vars.
 */
type InjectMembers<
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = {
	[K in `terminate${CoreArgObjectWords[I]["singularCapitalizedWord"]}`]: (
		this: ConcreteInstance<I, O, ParentIds>
	) => void;
};
// #endregion

// #region Classes
/**
 * Use as `this`.
 */
export type ConcreteInstance<
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArg<I, O, ParentIds> & InjectMembers<I, O, ParentIds>;

/**
 * Universe object instance minimal constraint.
 */
export type CoreUniverseObject<
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ConcreteInstance<I, O, ParentIds>;
// #endregion

/**
 * Factory for core universe object class.
 *
 * @param param - Destructured parameter
 * @returns - Core universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectFactory<
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	BaseClass extends new (...args: any[]) => {},
	ParentId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
>({
	Base,
	parentId,
	options,
	childId,
	grandparentIds
}: {
	/**
	 * Base class.
	 */
	Base: BaseClass;

	/**
	 * Universe object ID.
	 */
	parentId: ParentId;

	/**
	 * Arg index.
	 *
	 * Set must contain all elements of type `GrandparentIds`.
	 */
	grandparentIds: Set<GrandparentIds>;

	/**
	 * Args options.
	 */
	options: Options;

	/**
	 * Whether this is a container or not.
	 */
	childId: ChildId extends never ? null : ChildId;
}) {
	/**
	 * Part of members object responsible for extended path.
	 */
	type ExtendedPathMembers = {
		[K in Options extends CoreArgOptionsPathExtended ? GrandparentIds : never as `universeObjectUuidExtended${K}`]: {
			/**
			 * Extended path UUID property name.
			 */
			name: CoreArgPathUuidPropertyName<K>;

			/**
			 * Extended path UUID value.
			 */
			value: (arg: MemberGenerateParameter) => Uuid;
		};
	};

	/**
	 * Is a container or not.
	 */
	type IsContainer = ChildId extends never ? false : true;

	/**
	 * Type of the container class, no matter if it's a container or not.
	 */
	type ContainerClass = Exclude<typeof containerBase, null>;

	/**
	 * Instance type of universe object.
	 */
	type ThisInstance = ConcreteInstance<ParentId, Options, GrandparentIds>;

	/**
	 * This type, if container.
	 */
	type ContainerInstance = InstanceType<ContainerClass>;

	/**
	 * Parameter for member generation function.
	 */
	type MemberGenerateParameter = CoreArg<ParentId, Options, GrandparentIds>;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParameters = [MemberGenerateParameter, ...any[]];

	/**
	 * Return class type.
	 */
	type ReturnClass = ComputedClassExtract<typeof members, ConstructorParameters> extends ConcreteInstance<
		ParentId,
		Options,
		GrandparentIds
	>
		? (IsContainer extends true ? ContainerClass : typeof ParentUniverseObject) &
				(abstract new (...args: any[]) => ComputedClassExtract<typeof members, ConstructorParameters>)
		: never;

	// Inferring for final type
	const parentWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[ParentId]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[ParentId]["singularCapitalizedWord"];
	} = coreArgObjectWords[parentId];

	// Inferring for final type
	const childWords: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[ChildId]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[ChildId]["singularCapitalizedWord"];
	} = coreArgObjectWords[childId];

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
	const nameParentUniverseObjectUuid = coreArgIdToPathUuidPropertyName({ id: parentId });

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
		childId === null
			? null
			: CoreUniverseObjectContainerFactory<BaseClass, ChildUniverseObject, ChildId, Options, ParentId | GrandparentIds>(
					{
						Base,
						options,
						// Overriding conditional type - removing "null"
						universeObjectId: childId as ChildId
					}
			  );

	let extendedPathMembers: ExtendedPathMembers =
		options.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
			? [...grandparentIds].reduce((result, id) => {
					let uuidPropertyName: CoreArgPathUuidPropertyName<typeof id> = coreArgIdToPathUuidPropertyName({ id });
					return {
						...result,
						[`universeObjectUuidExtended${id}`]: {
							name: uuidPropertyName,

							/**
							 * Extended path UUID.
							 *
							 * @param arg - Arg from constructor
							 * @returns UUID of grandparent universe object
							 */
							value: (arg: MemberGenerateParameter): Uuid => {
								return arg[uuidPropertyName];
							}
						}
					};
			  }, {} as ExtendedPathMembers)
			: ({} as ExtendedPathMembers);

	/**
	 * Members to work on to initialize instance.
	 */
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		// Dummy
		assign: {},

		generate: {
			terminateUniverseObject: {
				name: nameParentTerminateUniverseObject,
				/**
				 * Terminate universe object function.
				 *
				 * @returns Terminate universe object function
				 */
				value: (): ((this: ThisInstance) => void) =>
					childId === null
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
				value: (arg: MemberGenerateParameter): Uuid => {
					return arg[nameParentUniverseObjectUuid];
				}
			},
			...extendedPathMembers
		}
	};

	/**
	 * Overall base class to be used, with potentially lost type information.
	 */
	const newBase: BaseClass = containerBase === null ? Base : containerBase;

	/**
	 * Actual class for core universe object.
	 *
	 * @remarks
	 * Impossible to directly extend generic factory with unknown member names.
	 */
	abstract class ParentUniverseObject extends newBase {
		/**
		 * Public constructor.
		 *
		 * @param args - Mixin args
		 * @remarks
		 * When assigning to members, value is cast for extra type safety.
		 */
		public constructor(...args: any[]) {
			const arg: CoreArg<ParentId, Options, GrandparentIds> = (args as ConstructorParameters)[0];

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
	return ParentUniverseObject as ReturnClass;
}
