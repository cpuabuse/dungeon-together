/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { DeferredPromise } from "../../common/async";
import {
	ComputedClassActualData,
	ComputedClassActualMembers,
	ComputedClassClassConstraint,
	ComputedClassClassImplements,
	ComputedClassConstraintData,
	ComputedClassConstraintMembers,
	ComputedClassDataExtends,
	ComputedClassExtractClass,
	ComputedClassExtractInstance,
	ComputedClassInfo,
	ComputedClassInstanceConstraint,
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
	CoreArgsContainer,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveInstance, CoreBaseNonRecursiveStatic } from "../base";
import { CoreUniverseObjectInitializationParameter } from "./parameters";
import {
	CoreUniverseObjectArgsOptionsUnion,
	CoreUniverseObjectContainer,
	CoreUniverseObjectContainerClassConstraintDataExtends,
	CoreUniverseObjectContainerFactory,
	CoreUniverseObjectUniverse
} from ".";

/**
 * Parameters for universe object.
 */
export type CoreUniverseObjectConstructorParameters<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = [Arg, CoreUniverseObjectInitializationParameter, ConstructorParameters<BaseClass>];

/**
 * Class constraint data.
 *
 * @remarks
 * As extending is conditional, {@link CoreUniverseObjectContainerClassConstraintDataExtends} is used granularly. Otherwise, inference would not work appropriately. What this class was supposed to be populating, it's subclasses should instead.
 *
 * Constraint is not dependent on the base, due to the fact that the non-recursive core base used, should not be a generic {@link CoreBaseClassNonRecursive}.
 */
type CoreUniverseObjectClassConstraintData<
	BaseClass extends CoreBaseClassNonRecursive,
	// Preserve for future type merging
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never,
	IsContainer extends boolean = [ChildId] extends [never] ? false : true
> =
	// General data

	// Since extends base and populate are conditional, they must be inserted manually, without intersection
	ComputedClassConstraintData<{
		/**
		 * Instance, containing only injected concrete methods.
		 */
		[ComputedClassWords.Instance]: ComputedClassConstraintMembers & {
			/**
			 * Base.
			 */
			[ComputedClassWords.Base]: [ChildId] extends [never]
				? // Inserting instance, as separated version from class is already provided
				  CoreBaseNonRecursiveInstance
				: CoreUniverseObjectContainerClassConstraintDataExtends<
						BaseClass,
						BaseClass,
						ChildUniverseObjectInstance,
						ChildArg,
						ChildId,
						Options,
						Id,
						ParentId | GrandparentIds
				  >[ComputedClassWords.Instance][ComputedClassWords.Base];

			/**
			 * Externally generated.
			 */
			[ComputedClassWords.Inject]: object &
				(IsContainer extends true
					? Pick<
							CoreUniverseObjectContainerClassConstraintDataExtends<
								BaseClass,
								BaseClass,
								ChildUniverseObjectInstance,
								ChildArg,
								ChildId,
								Options,
								Id,
								ParentId | GrandparentIds
							>[ComputedClassWords.Instance][ComputedClassWords.Populate],
							`add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`
					  >
					: unknown) & {
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
				: Pick<
						CoreUniverseObjectContainerClassConstraintDataExtends<
							BaseClass,
							BaseClass,
							ChildUniverseObjectInstance,
							ChildArg,
							ChildId,
							Options,
							Id,
							ParentId | GrandparentIds
						>[ComputedClassWords.Instance][ComputedClassWords.Populate],
						`default${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`
				  >;
		};

		/**
		 * Class, containing only inherited abstract methods.
		 */
		[ComputedClassWords.Static]: ComputedClassConstraintMembers & {
			/**
			 * Base.
			 */
			[ComputedClassWords.Base]: [ChildId] extends [never]
				? // Inserting static, as only static methods are necessary
				  CoreBaseNonRecursiveStatic
				: CoreUniverseObjectContainerClassConstraintDataExtends<
						BaseClass,
						BaseClass,
						ChildUniverseObjectInstance,
						ChildArg,
						ChildId,
						Options,
						Id,
						ParentId | GrandparentIds
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
						BaseClass,
						BaseClass,
						ChildUniverseObjectInstance,
						ChildArg,
						ChildId,
						Options,
						Id,
						ParentId | GrandparentIds
				  >[ComputedClassWords.Static][ComputedClassWords.Populate];
		};
	}>;

/**
 * Class constraint data to be used by extending computed classes.
 */
export type CoreUniverseObjectClassConstraintDataExtends<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassDataExtends<
	CoreUniverseObjectClassConstraintData<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId
	>
>;

/**
 * Universe object instance minimal constraint.
 */
export type CoreUniverseObject<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassInstanceConstraint<
	CoreUniverseObjectClassConstraintData<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId
	>
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
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassClassConstraint<
	CoreUniverseObjectClassConstraintData<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId
	>,
	CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>
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
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArgPath<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassClassImplements<
	CoreUniverseObjectClassConstraintData<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId
	>
>;

/**
 * Factory for core universe object class.
 *
 * @remarks
 * Use first constructor overload only.
 *
 * @param param - Destructured parameter
 * @typeParam ChildArg - Argument for the child universe object; Cannot be inferred correctly by child class from `Arg`, probably due to it being part of map
 * @returns - Core universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectFactory<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds> &
		CoreArgsContainer<ChildArg, ChildId, Options, Id | ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
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
	 * Parameter constraint for class to extend.
	 *
	 * @remarks
	 * Verified by passing `SuperClass` into class info.
	 */
	type SuperConstructorExtends = AbstractConstructor<ConstructorParameters<BaseClass>>;

	/**
	 * Actual super class.
	 */
	type ActualSuperClass = IsContainer extends true ? ContainerBase : BaseClass;

	/**
	 * Super class to extend.
	 *
	 * @remarks
	 * Constrains actual super class to extends to be used, if fails, the return result will be never.
	 */
	type SuperClass = ActualSuperClass extends SuperConstructorExtends ? ActualSuperClass : never;

	/**
	 * Type of the container class, no matter if it's a container or not.
	 */
	type ContainerInstance = CoreUniverseObjectContainer<
		BaseClass,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	>;

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
	 * Parameters for class constructor.
	 */
	type ConstructorParams = CoreUniverseObjectConstructorParameters<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId | GrandparentIds
	>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateParams = [
		{
			/**
			 * Arg path.
			 */
			arg: Arg;
		}
	];

	/**
	 * Actual class info.
	 */
	type ClassInfo = ComputedClassInfo<
		CoreUniverseObjectClassConstraintData<
			BaseClass,
			Arg,
			Id,
			Options,
			ParentId,
			GrandparentIds,
			ChildUniverseObjectInstance,
			ChildArg,
			ChildId
		>,
		ComputedClassActualData<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: ComputedClassActualMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: InstanceType<SuperClass>;

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
			[ComputedClassWords.Static]: ComputedClassActualMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: StaticMembers<SuperClass>;

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
	type ThisInstanceConcrete = ClassInfo[ComputedClassWords.ThisInstanceConcrete];

	/**
	 * Type of `this` in static methods.
	 *
	 * @remarks
	 * Contains information about base.
	 */
	type ThisStaticConcrete = ClassInfo[ComputedClassWords.ThisStaticConcrete];

	/**
	 * Return class type.
	 */
	// Condition to be able to access static portion of members, if it was dependent on generic parameters
	type ReturnClass = ClassInfo[ComputedClassWords.ClassReturn];

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
		const nameAttachChildUniverseObjects = `attach${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
		const nameAddChildUniverseObjects = `add${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
		const nameChildUniverseObjectClass = `${childWords.singularCapitalizedWord}` as const; // Name of child class
		/* eslint-enable @typescript-eslint/typedef */

		/**
		 * Union removes container base type information, so new base was split into two, including this.
		 */
		// Need to extract type
		// eslint-disable-next-line @typescript-eslint/typedef
		const ContainerBase = CoreUniverseObjectContainerFactory<
			BaseClass,
			BaseClass,
			ChildUniverseObjectInstance,
			ChildArg,
			ChildId,
			Options,
			Id,
			ParentId | GrandparentIds
		>({
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
				addChildUniverseObject: {
					name: nameAddChildUniverseObjects,

					// ESLint buggy
					// eslint-disable-next-line jsdoc/require-param
					/**
					 * @param this - Instance of container
					 */
					value(
						this: ThisInstanceConcrete,
						childArgs: CoreUniverseObjectConstructorParameters<
							BaseClass,
							ChildArg,
							ChildId,
							Options,
							ParentId | GrandparentIds
						>
					): void {
						// ESLint buggy for nested destructured params
						// eslint-disable-next-line @typescript-eslint/typedef
						let [, { attachHook, created }]: CoreUniverseObjectConstructorParameters<
							BaseClass,
							ChildArg,
							ChildId,
							Options,
							ParentId | GrandparentIds
						> = childArgs;
						setTimeout(() => {
							let child: ChildUniverseObjectInstance = new (
								this.universe as CoreUniverseObjectUniverse<
									BaseClass,
									ChildUniverseObjectInstance,
									ChildArg,
									ChildId,
									Options,
									Id | ParentId | GrandparentIds
								>
							)[nameChildUniverseObjectClass](...childArgs);

							// Call super method; Use prototype since cannot cast super; Manually type `call`, due to bug of implicit generic template overload
							(ContainerBase.prototype as ContainerInstance)[nameAttachChildUniverseObjects].call<
								ThisInstanceConcrete,
								[
									universeObject: ChildUniverseObjectInstance,
									initializationParameter: Pick<CoreUniverseObjectInitializationParameter, "attachHook">
								],
								void
							>(this, child, { attachHook });

							// Call hook
							created.resolve();
						});
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
		 * Dummy type with static part excluded, as inference would not work on instance type of class with generic static methods.
		 *
		 * @remarks
		 * From the perspective of a parent, it's child doesn't have grandparents, which is incompatible with {@link ThisInstanceConcrete}.
		 */
		type ParentUniverseObjectInstance = ComputedClassInstanceConstraint<{
			/**
			 * Instance.
			 */
			[ComputedClassWords.Instance]: CoreUniverseObjectClassConstraintData<
				BaseClass,
				CoreArg<ParentId, Options> & CoreArgsContainer<CoreArg<Id, Options, ParentId>, Id, Options, ParentId>,
				ParentId,
				Options,
				never,
				never,
				CoreUniverseObject<BaseClass, CoreArg<Id, Options, ParentId>, Id, Options, ParentId>,
				CoreArg<Id, Options, ParentId>,
				Id
			>[ComputedClassWords.Instance];

			/**
			 * Static.
			 */
			[ComputedClassWords.Static]: ComputedClassConstraintMembers;
		}>;

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
						let parentUniverseObject: ParentUniverseObjectInstance = (
							this.universe as CoreUniverseObjectUniverse<
								BaseClass,
								ParentUniverseObjectInstance,
								CoreArg<ParentId, Options>,
								ParentId,
								Options
							>
						)[nameGetParentUniverseObject](path);

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
				value(this: ThisInstanceConcrete, ...[{ arg }]: GenerateParams): Uuid {
					return arg[nameUniverseObjectUuid];
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
	const newBase: SuperConstructorExtends = childData === null ? Base : childData.ContainerBase;

	/**
	 * Actual class for core universe object.
	 *
	 * @remarks
	 * Impossible to directly extend generic factory with unknown member names.
	 */
	abstract class UniverseObject
		extends newBase
		implements StaticImplements<ClassInfo[ComputedClassWords.ClassImplements], typeof UniverseObject>
	{
		// ESLint buggy
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Public constructor.
		 *
		 * @remarks
		 * When assigning to members, value is cast for extra type safety.
		 */
		// ESLint buggy for nested destructured params
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor(...[arg, { created, attachHook }, superParams]: ConstructorParams) {
			// Call super constructor
			super(...superParams);

			// Assign properties
			computedClassGenerate({ args: [{ arg }], members, that: this as unknown as ThisInstanceConcrete });

			if (typeof childId === "undefined") {
				created.resolve();
			} else {
				Promise.all(
					Array.from(arg["" as `${CoreArgObjectWords[ChildId]["pluralLowercaseWord"]}`].values()).map(childArg => {
						let childCreatedPromise: DeferredPromise<void> = new DeferredPromise<void>();

						(this as ContainerInstance)["" as `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]([
							childArg,
							{ attachHook, created: childCreatedPromise },
							superParams
						]);

						return childCreatedPromise;
					})
				)
					.then(() => {
						// Finally resolve this creation
						created.resolve();
					})
					.catch(() => {
						// Pass error handling upstairs
						created.reject();
					});
			}
		}
	}

	computedClassAssign({ Base: UniverseObject, members });

	// Return
	// Conditionally checking if class is appropriately extending arg container to make sure injected class type is properly implemented
	return UniverseObject as ReturnClass;
}
