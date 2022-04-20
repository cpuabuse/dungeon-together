/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import {
	ComputedClassClassConstraint,
	ComputedClassClassImplements,
	ComputedClassData,
	ComputedClassDataExtends,
	ComputedClassExtractClass,
	ComputedClassExtractInstance,
	ComputedClassInfo,
	ComputedClassInstanceConstraint,
	ComputedClassMembers,
	ComputedClassWords,
	computedClassAssign,
	computedClassGenerate
} from "../../common/computed-class";
import { urlPathSeparator } from "../../common/defaults";
import { AbstractConstructor, MaybeDefined, StaticImplements, StaticMembers } from "../../common/utility-types";
import { Uuid, getDefaultUuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsPathExtendedUnion,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveInstance, CoreBaseNonRecursiveStatic } from "../base";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectContainer,
	CoreUniverseObjectContainerClass,
	CoreUniverseObjectContainerClassConstraintDataExtends,
	CoreUniverseObjectContainerFactory,
	CoreUniverseObjectUniverse
} from ".";

/**
 * Constraint for a universe object container part.
 */
type CoreUniverseObjectClassContainerConstraintData<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never,
	Condition extends boolean = [ChildId] extends [never] ? false : true
> = ComputedClassData<{
	/**
	 * Instance, containing only injected concrete methods.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers & {
		/**
		 * Externally generated.
		 */
		[ComputedClassWords.Inject]: Condition extends true
			? {
					[K in `attach${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
						universeObject: ChildUniverseObject
					) => void;
			  } & {
					[K in `detach${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
						path: CoreArgPath<ChildId, CoreArgOptionsPathOwn, Id | ParentId | GrandparentIds>
					) => boolean;
			  }
			: unknown;
	};

	/**
	 * Class, containing only inherited abstract methods.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers;
}>;

/**
 * Class constraint data.
 *
 * @remarks
 * As extending is conditional, {@link CoreUniverseObjectContainerClassConstraintDataExtends} is used granularly. Otherwise, inference would not work appropriately. What this class was supposed to be populating, it's subclasses should instead.
 *
 * Constraint is not dependent on the base, due to the fact that the non-recursive core base used, should not be a generic {@link CoreBaseClassNonRecursive}.
 */
type CoreUniverseObjectClassConstraintData<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> =
	// Container specific data
	CoreUniverseObjectClassContainerConstraintData<Id, Options, ParentId, GrandparentIds, ChildUniverseObject, ChildId> &
		// General data

		// Since extends base and populate are conditional, they must be inserted manually, without intersection
		ComputedClassData<{
			/**
			 * Instance, containing only injected concrete methods.
			 */
			[ComputedClassWords.Instance]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: [ChildId] extends [never]
					? // Inserting instance, as separated version from class is already provided
					  CoreBaseNonRecursiveInstance
					: CoreUniverseObjectContainerClassConstraintDataExtends<
							ChildUniverseObject,
							ChildId,
							Options,
							CoreBaseClassNonRecursive
					  >[ComputedClassWords.Instance][ComputedClassWords.Base];

				/**
				 * Externally generated.
				 */
				[ComputedClassWords.Inject]: object & {
					[K in `terminate${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: () => void;
				} & CoreArg<Id, Options, ParentId | GrandparentIds> &
					([ParentId] extends [never]
						? unknown
						: {
								[K in `move${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
									path: CoreArgPath<ParentId, Options, GrandparentIds>
								) => void;
						  });

				/**
				 * Implement.
				 *
				 * @remarks
				 * Re-implement in subclass.
				 * Since extended populate is not statically known (conditional), it cannot be added to populate.
				 *
				 * @see {@link ComputedClassDataExtends}
				 */
				[ComputedClassWords.Implement]: [ChildId] extends [never]
					? object
					: CoreUniverseObjectContainerClassConstraintDataExtends<
							ChildUniverseObject,
							ChildId,
							Options,
							CoreBaseClassNonRecursive
					  >[ComputedClassWords.Instance][ComputedClassWords.Populate];
			};

			/**
			 * Class, containing only inherited abstract methods.
			 */
			[ComputedClassWords.Static]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: [ChildId] extends [never]
					? // Inserting static, as only static methods are necessary
					  CoreBaseNonRecursiveStatic
					: CoreUniverseObjectContainerClassConstraintDataExtends<
							ChildUniverseObject,
							ChildId,
							Options,
							CoreBaseClassNonRecursive
					  >[ComputedClassWords.Static][ComputedClassWords.Base];

				/**
				 * Externally generated.
				 */
				[ComputedClassWords.Inject]: [ChildId] extends [never]
					? object
					: {
							[K in `getDefault${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}Uuid`]: (
								path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
							) => Uuid;
					  };

				/**
				 * Implement.
				 *
				 * @remarks
				 * Re-implement in subclass.
				 * Since extended populate is not statically known (conditional), it cannot be added to populate.
				 *
				 * @see {@link ComputedClassDataExtends}
				 */
				[ComputedClassWords.Implement]: [ChildId] extends [never]
					? object
					: CoreUniverseObjectContainerClassConstraintDataExtends<
							ChildUniverseObject,
							ChildId,
							Options
					  >[ComputedClassWords.Static][ComputedClassWords.Populate];
			};
		}>;

/**
 * Class constraint data to be used by extending computed classes.
 */
export type CoreUniverseObjectClassConstraintDataExtends<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassDataExtends<
	CoreUniverseObjectClassConstraintData<Id, Options, ParentId, GrandparentIds, ChildUniverseObject, ChildId>
>;

/**
 * Universe object instance minimal constraint.
 */
export type CoreUniverseObject<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassInstanceConstraint<
	CoreUniverseObjectClassConstraintData<Id, Options, ParentId, GrandparentIds, ChildUniverseObject, ChildId>
>;

/**
 * Universe object class minimal constraint.
 *
 * @remarks
 * Inherits non recursive core base from constructor returning {@link CoreUniverseObject}.
 *
 * Constructor arguments are empty, so that `extends` on this will work.
 */
export type CoreUniverseObjectClass<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassClassConstraint<
	CoreUniverseObjectClassConstraintData<Id, Options, ParentId, GrandparentIds, ChildUniverseObject, ChildId>
>;

/**
 * Abstract part ot the class from {@link CoreUniverseObjectFactory}.
 *
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreUniverseObjectClassImplements<
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentIds | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassClassImplements<
	CoreUniverseObjectClassConstraintData<Id, Options, ParentIds, GrandparentIds, ChildUniverseObject, ChildId>
>;

/**
 * Factory for core universe object class.
 *
 * @remarks
 * Use first constructor overload only.
 *
 * @param param - Destructured parameter
 * @returns - Core universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, Id, ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
>({
	Base,
	id,
	options,
	childId,
	parentId,
	grandparentIds
}: {
	/**
	 * Base class.
	 */
	Base: BaseClass;

	/**
	 * Universe object ID.
	 */
	id: Id;

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
} & MaybeDefined<
	[ChildId] extends [never] ? false : true,
	{
		/**
		 * Whether this is a container or not.
		 */
		childId: ChildId;
	}
> &
	MaybeDefined<
		[ParentId] extends [never] ? false : true,
		{
			/**
			 * Optional parent ID.
			 */
			parentId: ParentId;
		}
	>) {
	/**
	 * Is a container or not.
	 *
	 * To be used as a type discriminant for container.
	 */
	type IsContainer = [ChildId] extends [never] ? false : true;

	/**
	 * Base class type in case of container.
	 */
	type ContainerBase = Exclude<typeof childData, null>["ContainerBase"];

	/**
	 * Extra members from container.
	 *
	 * @remarks
	 * When using with extract function, access the property types individually.
	 */
	type MaybeContainerMembers<Key extends "assign" | "staticAssign"> = [ChildId] extends [never]
		? typeof nonContainerMembers[Key]
		: Exclude<typeof childData, null>[Key];

	/**
	 * Extra members from container.
	 *
	 * @remarks
	 * When using with extract function, access the property types individually.
	 */
	type MaybeParentMembers<Key extends "assign" | "staticAssign"> = [ParentId] extends [never]
		? typeof nonParentMembers[Key]
		: Exclude<typeof parentData, null>[Key];

	/**
	 * Type of the container class, no matter if it's a container or not.
	 */
	type ContainerInstance = CoreUniverseObjectContainer<ChildUniverseObject, ChildId, Options>;

	/**
	 * Base constructor parameters to extend.
	 */
	type BaseParams = ConstructorParameters<[ChildId] extends [never] ? BaseClass : ContainerBase>;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParams = [CoreArg<Id, Options, ParentId | GrandparentIds>, ...BaseParams];

	/**
	 * Parameters for generate functions.
	 */
	type GenerateParams = [
		{
			/**
			 * Arg path.
			 */
			path: ConstructorParams[0];
		}
	];

	/**
	 * Actual class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreUniverseObjectClassConstraintData<Id, Options, ParentId, GrandparentIds, ChildUniverseObject, ChildId>,
		ComputedClassData<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: IsContainer extends true ? InstanceType<ContainerBase> : InstanceType<BaseClass>;

				/**
				 * Inject.
				 */
				[ComputedClassWords.Inject]: ComputedClassExtractInstance<typeof members, ThisInstanceConcrete, GenerateParams>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: UniverseObject;
			};

			/**
			 * Static.
			 */
			[ComputedClassWords.Static]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: StaticMembers<IsContainer extends true ? ContainerBase : BaseClass>;

				/**
				 * Inject.
				 */
				[ComputedClassWords.Inject]: ComputedClassExtractClass<typeof members>;

				/**
				 * Populate.
				 */
				[ComputedClassWords.Populate]: StaticMembers<typeof UniverseObject>;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * Part of members object responsible for extended path.
	 */
	type ExtendedPathMembers = {
		[K in Options extends CoreArgOptionsPathExtendedUnion
			? ParentId | GrandparentIds
			: never as `universeObjectUuidExtended${K}`]: {
			/**
			 * Extended path UUID property name.
			 */
			name: CoreArgPathUuidPropertyName<K>;

			/**
			 * Extended path UUID value.
			 */
			value: (...arg: ConstructorParams) => Uuid;
		};
	};

	/**
	 * Instance type of universe object.
	 */
	type ThisInstanceConcrete = ActualClassInfo[ComputedClassWords.ThisInstanceConcrete];

	/**
	 * Type of `this` in static methods.
	 *
	 * @remarks
	 * Contains information about base.
	 */
	type ThisStaticConcrete = ActualClassInfo[ComputedClassWords.ThisStaticConcrete];

	/**
	 * Return class type.
	 */
	// Condition to be able to access static portion of members, if it was dependent on generic parameters
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	// Inferring for final type
	const words: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[Id]["singularCapitalizedWord"];
	} = coreArgObjectWords[id];

	/* eslint-disable @typescript-eslint/typedef */
	const nameTerminateUniverseObject = `terminate${words.singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjectUuid = coreArgIdToPathUuidPropertyName({ id }); // Name of universe object UUID
	const nameMoveUniverseObject = `move${words.singularCapitalizedWord}` as const; // Name of move universe object function
	const universeObjectsUuidPath = `pluralLowercaseWord` as const; // Name of universe object UUID
	/* eslint-enable @typescript-eslint/typedef */

	/**
	 * Information needed for child.
	 *
	 * To be used as a value discriminant for container.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/typedef
	const childData = (() => {
		if (typeof childId === "undefined") return null;

		// Words to be used for child, if not child, then null
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
		/* eslint-disable @typescript-eslint/typedef */
		const nameTerminateChildUniverseObject = `terminate${childWords.singularCapitalizedWord}` as const; // Name of remove universe object function, if child is present, otherwise null
		const nameStaticGetDefaultChildUniverseObjectUuid = `getDefault${childWords.singularCapitalizedWord}Uuid` as const; // Name of universe object UUID
		const nameChildUniverseObjects = `${childWords.pluralLowercaseWord}` as const; // Name of universe objects member
		const nameDetachChildUniverseObjects = `detach${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
		const nameAttachChildUniverseObjects = `attach${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
		const childPathUuidPropertyName: CoreArgPathUuidPropertyName<ChildId> = coreArgIdToPathUuidPropertyName({
			id: childId
		});
		/* eslint-enable @typescript-eslint/typedef */

		/**
		 * Union removes container base type information, so new base was split into two, including this.
		 */
		// Need to extract type
		// eslint-disable-next-line @typescript-eslint/typedef
		const ContainerBase = CoreUniverseObjectContainerFactory<BaseClass, ChildUniverseObject, ChildId, Options>({
			Base,
			// Overriding conditional type - removing "null"
			id: childId,
			options
		});

		return {
			// Base class in case of container
			ContainerBase,

			// Instance assign
			assign: {
				attachChildUniverseObject: {
					name: nameAttachChildUniverseObjects,

					/**
					 * Detaches child universe object.
					 *
					 * @param this - This instance
					 * @param universeObject - Child universe object
					 */
					value(this: ThisStaticConcrete, universeObject: ChildUniverseObject): void {
						(this as ContainerInstance)[nameChildUniverseObjects].set(
							universeObject[childPathUuidPropertyName],
							universeObject
						);
					}
				},

				detachChildUniverseObject: {
					name: nameDetachChildUniverseObjects,

					/**
					 * Detaches child universe object.
					 *
					 * @param this - This instance
					 * @param path - Child universe object
					 * @returns True if detached, false if not
					 */
					value(
						this: ThisStaticConcrete,
						path: CoreArgPath<ChildId, CoreArgOptionsPathOwn, Id | ParentId | GrandparentIds>
					): boolean {
						return (this as ContainerInstance)[nameChildUniverseObjects].delete(path[childPathUuidPropertyName]);
					}
				},

				terminateUniverseObject: {
					name: nameTerminateUniverseObject,

					/**
					 * Terminates children of universe object.
					 *
					 * @param this - Core universe object instance
					 */
					value(this: ThisInstanceConcrete): void {
						(this as ContainerInstance)[nameChildUniverseObjects].forEach(universeObject => {
							universeObject[nameTerminateChildUniverseObject]();
						});
					}
				}
			},

			// Static optional method
			staticAssign: {
				getDefaultUniverseObjectUuid: {
					name: nameStaticGetDefaultChildUniverseObjectUuid,

					/**
					 * Get default universe object UUID.
					 *
					 * @param this - Type of class
					 * @param path - Universe object own path
					 * @returns Default universe object UUID
					 */
					value(
						this: ThisStaticConcrete,
						path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
					): Uuid {
						return getDefaultUuid({
							path: `${universeObjectsUuidPath}${urlPathSeparator}${path[nameUniverseObjectUuid]}`
						});
					}
				}
			}
		};
	})();

	/**
	 * To be used as a value discriminant for parent.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/typedef
	const parentData = (() => {
		/**
		 * Path for a parent.
		 */
		type ParentPath = CoreArgPath<ParentId, Options, GrandparentIds>;

		/**
		 * Dummy type, constructed from assumption that parent has no parents.
		 *
		 * @remarks
		 * From the perspective of a parent, it's child doesn't have grandparents, which is incompatible with {@link ThisInstanceConcrete}.
		 */
		type ParentUniverseObject = ComputedClassInstanceConstraint<
			CoreUniverseObjectClassContainerConstraintData<
				ParentId,
				Options,
				never,
				never,
				CoreUniverseObject<Id, Options, ParentId>,
				Id,
				true
			>
		>;

		// Null if not present
		if (typeof parentId === "undefined") return null;

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

		/* eslint-disable @typescript-eslint/typedef */
		const nameGetParentUniverseObject = `get${parentWords.singularCapitalizedWord}` as const; // Name of remove universe object function
		const nameAttachUniverseObject = `attach${words.singularCapitalizedWord}` as const; // Name of remove universe object function
		/* eslint-enable @typescript-eslint/typedef */

		// Otherwise
		return {
			assign: {
				moveUniverseObject: {
					name: nameMoveUniverseObject,

					/**
					 * Moves universe object to a different parent.
					 *
					 * @param this - Destructured `this`
					 * @param path - Parent path
					 */
					value(this: ThisInstanceConcrete, path: ParentPath): void {
						// Locate cells
						// Does not overlap, casting
						let parentUniverseObject: ParentUniverseObject = (
							this.universe as CoreUniverseObjectUniverse<ParentId, GrandparentIds, ParentPath>
						)[nameGetParentUniverseObject](path) as ParentUniverseObject;

						// Reattach
						parentUniverseObject[nameAttachUniverseObject](this);
					}
				}
			},

			staticAssign: {}
		};
	})();

	let extendedPathMembers: ExtendedPathMembers =
		options.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
			? // Cast as `ParentId`, since `parentData` is a discriminant for parent presence
			  [...(parentData === null ? [] : [parentId as ParentId]), ...grandparentIds].reduce((result, i) => {
					let uuidPropertyName: CoreArgPathUuidPropertyName<typeof i> = coreArgIdToPathUuidPropertyName({ id: i });
					return {
						...result,
						[`universeObjectUuidExtended${i}`]: {
							name: uuidPropertyName,

							// ESLint buggy
							// eslint-disable-next-line jsdoc/require-param
							/**
							 * Extended path UUID.
							 *
							 * @param arg - Arg from constructor
							 * @returns UUID of grandparent universe object
							 */
							value: (...[arg]: ConstructorParams): Uuid => {
								return arg[uuidPropertyName];
							}
						}
					};
			  }, {} as ExtendedPathMembers)
			: ({} as ExtendedPathMembers);

	/**
	 * Members injected, when not a container.
	 */
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	const nonContainerMembers = {
		assign: {
			terminateUniverseObject: {
				name: nameTerminateUniverseObject,
				/**
				 * Terminate universe object function.
				 *
				 * @param this - This instance
				 */
				value(this: ThisInstanceConcrete): void {
					// Nothing, debug info can be added later
				}
			}
		},

		staticAssign: {}
	};

	/**
	 * Members injected, when not having a parent.
	 */
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	const nonParentMembers = {
		assign: {},

		staticAssign: {}
	};

	/**
	 * Members to work on to initialize instance.
	 */
	// Infer for type checks
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		assign: {
			...((childData === null ? nonContainerMembers : childData).assign as MaybeContainerMembers<"assign">),
			...((parentData === null ? nonParentMembers : parentData).assign as MaybeParentMembers<"assign">)
		},

		generate: {
			universeObjectUuid: {
				name: nameUniverseObjectUuid,

				// ESLint buggy
				// eslint-disable-next-line jsdoc/require-param
				/**
				 *	Universe object UUID.
				 *
				 * @param this - This instance
				 * @param arg - CoreArg given to constructor
				 * @returns UUID of the universe object
				 */
				// Nested destructuring bug - https://github.com/typescript-eslint/typescript-eslint/issues/4725
				// eslint-disable-next-line @typescript-eslint/typedef
				value(this: ThisInstanceConcrete, ...[{ path }]: GenerateParams): Uuid {
					return path[nameUniverseObjectUuid];
				}
			},
			...extendedPathMembers
		},

		staticAssign: {
			...((childData === null ? nonContainerMembers : childData).staticAssign as MaybeContainerMembers<"staticAssign">)
		}
	};

	/**
	 * Overall base class to be used, with potentially lost type information.
	 *
	 * Uses `BaseParameters` as we know the final superclass constructor parameters to be that no matter what.
	 *
	 * @remarks
	 * Abstract, as it might extend container, which is abstract.
	 */
	const newBase: AbstractConstructor<BaseParams> =
		childData === null
			? Base
			: (childData.ContainerBase as CoreUniverseObjectContainerClass<ChildUniverseObject, ChildId, Options>);

	/**
	 * Actual class for core universe object.
	 *
	 * @remarks
	 * Impossible to directly extend generic factory with unknown member names.
	 */
	abstract class UniverseObject
		extends newBase
		implements StaticImplements<ActualClassInfo[ComputedClassWords.ClassImplements], typeof UniverseObject>
	{
		/**
		 * Public constructor.
		 *
		 * @param args - Mixin args
		 * @remarks
		 * When assigning to members, value is cast for extra type safety.
		 */
		public constructor(...args: ConstructorParams) {
			const [path, ...baseParams]: ConstructorParams = args;

			// Call super constructor
			super(...baseParams);

			// Assign properties
			computedClassGenerate({ args: [{ path }], members, that: this as unknown as ThisInstanceConcrete });
		}
	}

	computedClassAssign({ Base: UniverseObject, members });

	// Return
	// Conditionally checking if class is appropriately extending arg container to make sure injected class type is properly implemented
	return UniverseObject as ReturnClass;
}
