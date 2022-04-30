/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object common definitions
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
import {
	ConcreteConstructor,
	ConcreteConstructorConstraint,
	StaticImplements,
	StaticMembers
} from "../../common/utility-types";

import {
	CoreArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	CoreArgsContainer,
	CoreArgsWithMapContainerArg,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive } from "../base";
import { CoreUniverseObjectInitializationParameter } from "./parameters";
import { CoreUniverseObjectConstructorParameters } from "./universe-object";
import { CoreUniverseObject, CoreUniverseObjectArgsOptionsUnion } from ".";

/**
 * Data for class constraint.
 */
type CoreUniverseObjectContainerClassConstraintData<
	BaseClass extends ConcreteConstructorConstraint,
	ChildBaseClass extends CoreBaseClassNonRecursive,
	// We do not care what class is base class for child
	ChildUniverseObjectInstance extends CoreUniverseObject<
		ChildBaseClass,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassData<{
	/**
	 * Concrete injection and abstract members, no own members.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers & {
		/**
		 * Base instance.
		 */
		[ComputedClassWords.Base]: InstanceType<BaseClass>;

		/**
		 * Inject.
		 */
		[ComputedClassWords.Inject]: {
			[K in `get${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options, ParentId | GrandparentIds>
			) => ChildUniverseObjectInstance;
		} & {
			[K in `remove${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options, ParentId | GrandparentIds>
			) => void;
			// Cannot use instance type of generic class well
		} & {
			[K in `attach${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				universeObject: ChildUniverseObjectInstance,
				initializationParameter: Pick<CoreUniverseObjectInitializationParameter, "attachHook">
			) => void;
		} & {
			[K in `detach${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options, ParentId | GrandparentIds>
			) => boolean;
		} & CoreArgsContainer<ChildUniverseObjectInstance, ChildId, Options, ParentId | GrandparentIds>;

		/**
		 * Abstract.
		 */
		[ComputedClassWords.Implement]: {
			[K in `default${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: ChildUniverseObjectInstance;
		} & {
			// Necessary to implement where the created child is known, to call attach
			[K in `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				childArgs: CoreUniverseObjectConstructorParameters<
					ChildBaseClass,
					ChildArg,
					ChildId,
					Options,
					ParentId | GrandparentIds
				>
			) => void;
		};
	};

	/**
	 * No static members in this class.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers & {
		/**
		 * Base class.
		 */
		[ComputedClassWords.Base]: StaticMembers<BaseClass>;
	};
}>;

/**
 * Data to be consumed when extending.
 */
export type CoreUniverseObjectContainerClassConstraintDataExtends<
	BaseClass extends ConcreteConstructorConstraint,
	ChildBaseClass extends CoreBaseClassNonRecursive,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		ChildBaseClass,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassDataExtends<
	CoreUniverseObjectContainerClassConstraintData<
		BaseClass,
		ChildBaseClass,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>
>;

/**
 * Abstract part ot the class from {@link CoreUniverseObjectContainerFactory}.
 *
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 */
export type CoreUniverseObjectContainerClassImplements<
	ChildBaseClass extends CoreBaseClassNonRecursive,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		ChildBaseClass,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassClassImplements<
	CoreUniverseObjectContainerClassConstraintData<
		ConcreteConstructorConstraint,
		ChildBaseClass,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>
>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainerClass<
	ChildBaseClass extends CoreBaseClassNonRecursive,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		ChildBaseClass,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassClassConstraint<
	CoreUniverseObjectContainerClassConstraintData<
		ConcreteConstructorConstraint,
		ChildBaseClass,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>
>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainer<
	ChildBaseClass extends CoreBaseClassNonRecursive,
	ChildUniverseObjectInstance extends CoreUniverseObject<
		ChildBaseClass,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassInstanceConstraint<
	CoreUniverseObjectContainerClassConstraintData<
		ConcreteConstructorConstraint,
		ChildBaseClass,
		ChildUniverseObjectInstance,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>
>;

// #region Factory
/**
 * Factory for core universe object class.
 *
 * Args generic parameters cannot be replaced with index, since universe object information will not be extracted from index, as ID information will be lost, if not passed to an index from within this function.
 *
 * @remarks
 * Classes extending this must implement {@link CoreUniverseObjectContainerImplements}. Should be implemented anywhere in the chain, including up to first concrete class once. For simplicity, the first class to extends this should implement {@link CoreUniverseObjectContainerImplements}.
 *
 * Use first constructor overload only.
 *
 * @typeParam BaseClass - Base class to extend from
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @param param - Destructured Parameter
 * @returns Universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectContainerFactory<
	BaseClass extends ConcreteConstructor,
	ChildBaseClass extends CoreBaseClassNonRecursive,
	// It is irrelevant if child has grandchildren or not (same for parent)
	ChildUniverseObjectInstance extends CoreUniverseObject<
		CoreBaseClassNonRecursive,
		ChildArg,
		ChildId,
		Options,
		ParentId,
		GrandparentIds
	>,
	ChildArg extends CoreArg<ChildId, Options, ParentId | GrandparentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
>({
	Base,
	id,
	// Potentially to be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	options
}: {
	/**
	 * Base class.
	 */
	Base: BaseClass;

	/**
	 * Universe object ID.
	 */
	id: ChildId;

	/**
	 * Args options.
	 */
	options: Options;
}) {
	/**
	 * Constructor parameters for base.
	 */
	type SuperParams = ConstructorParameters<BaseClass>;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParams = SuperParams;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateParams = [];

	/**
	 * Actual class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreUniverseObjectContainerClassConstraintData<
			BaseClass,
			ChildBaseClass,
			ChildUniverseObjectInstance,
			ChildArg,
			ChildId,
			Options,
			ParentId,
			GrandparentIds
		>,
		ComputedClassData<{
			/**
			 * Instance part of the class.
			 */
			[ComputedClassWords.Instance]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: InstanceType<BaseClass>;

				/**
				 * Members assigned via prototype.
				 */
				[ComputedClassWords.Inject]: ComputedClassExtractInstance<typeof members, ThisInstanceConcrete, GenerateParams>;

				/**
				 * Members assigned via class block.
				 */
				[ComputedClassWords.Populate]: UniverseObjectContainer;
			};

			/**
			 * Static part of class.
			 */
			[ComputedClassWords.Static]: ComputedClassMembers & {
				/**
				 * Base.
				 */
				[ComputedClassWords.Base]: StaticMembers<BaseClass>;

				/**
				 * Members assigned via class block.
				 */
				[ComputedClassWords.Populate]: StaticMembers<typeof UniverseObjectContainer>;

				/**
				 * Injected static members.
				 */
				[ComputedClassWords.Inject]: ComputedClassExtractClass<typeof members>;
			};
		}>,
		ConstructorParams
	>;

	/**
	 * `this` for class methods.
	 */
	type ThisInstanceConcrete = ActualClassInfo[ComputedClassWords.ThisInstanceConcrete];

	/**
	 * Abstract `this`.
	 */
	type ThisInstanceAbstract = ActualClassInfo[ComputedClassWords.ThisInstanceAbstract];

	/**
	 * Class to implement.
	 */
	type ClassImplements = ActualClassInfo[ComputedClassWords.ClassImplements];

	/**
	 * Class type for return injection.
	 *
	 * Conditionally checking if class is appropriately extending arg container and injection is properly implemented. This is what makes sure {@link CoreUniverseObjectContainerClass} is safe to use.
	 */
	// Condition to be able to access `members` in with generic parameters
	type ReturnClass = ActualClassInfo[ComputedClassWords.ClassReturn];

	// Base words
	const {
		pluralLowercaseWord,
		singularCapitalizedWord
	}: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[ChildId]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[ChildId]["singularCapitalizedWord"];
	} = coreArgObjectWords[id];

	// Need to extract types
	/* eslint-disable @typescript-eslint/typedef */
	const nameGetUniverseObject = `get${singularCapitalizedWord}` as const; // Name of get universe object function
	const nameRemoveUniverseObject = `remove${singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
	const nameAttachUniverseObject = `attach${singularCapitalizedWord}` as const; // Name of attach universe object function
	const nameDetachUniverseObject = `detach${singularCapitalizedWord}` as const; // Name of detach universe object function
	const nameAbstractDefaultUniverseObject = `default${singularCapitalizedWord}` as const; // Name of default universe object
	/* eslint-enable @typescript-eslint/typedef */
	const pathUuidPropertyName: CoreArgPathUuidPropertyName<ChildId> = coreArgIdToPathUuidPropertyName({
		id
	}); // UUID property name within a path

	/**
	 * Members of class.
	 *
	 * @remarks
	 *
	 * - There are implicit constraints of how the const should be structured, but will implicitly be type checked during usage
	 * - Cannot use abstract as `this`, as it will mismatch when `super` is called
	 */
	// Inference required for type check
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		assign: {
			attachChildUniverseObject: {
				name: nameAttachUniverseObject,

				/**
				 * Attaches child universe object.
				 *
				 * @param this - This instance
				 * @param universeObject - Child universe object
				 * @param initializationParameter - Initialization parameter
				 */
				value(
					this: ThisInstanceConcrete,
					universeObject: ChildUniverseObjectInstance,
					// Keep for type consistency
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					initializationParameter: Pick<CoreUniverseObjectInitializationParameter, "attachHook">
				): void {
					this[nameUniverseObjects].set(universeObject[pathUuidPropertyName], universeObject);
				}
			},

			detachChildUniverseObject: {
				name: nameDetachUniverseObject,

				/**
				 * Detaches child universe object.
				 *
				 * @param this - This instance
				 * @param path - Child universe object
				 * @returns True if detached, false if not
				 */
				value(this: ThisInstanceConcrete, path: CoreArgPath<ChildId, Options, ParentId | GrandparentIds>): boolean {
					return this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
				}
			},
			getUniverseObject: {
				name: nameGetUniverseObject,
				/**
				 * Get universe object.
				 *
				 * @remarks
				 * To be overridden by universe.
				 *
				 * @param this - Universe object container
				 * @param path - Path to search for
				 * @returns Universe object
				 */
				value(this: ThisInstanceConcrete, path: CoreArg<ChildId, Options>): ChildUniverseObjectInstance {
					let universeObject: ChildUniverseObjectInstance | undefined = this[nameUniverseObjects].get(
						path[pathUuidPropertyName]
					);
					return universeObject === undefined
						? (this as ThisInstanceAbstract)[nameAbstractDefaultUniverseObject]
						: universeObject;
				}
			},
			removeUniverseObject: {
				name: nameRemoveUniverseObject,
				/**
				 * Removes the child object.
				 *
				 * @remarks
				 * To be added by universe.
				 *
				 * @param this - Universe object container
				 * @param path - Path to search for
				 */
				value(this: ThisInstanceConcrete, path: CoreArgPath<ChildId, Options>): void {
					this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
				}
			}
		},
		generate: {
			universeObjects: {
				name: nameUniverseObjects,
				/**
				 * Function generating a new map of universe objects.
				 *
				 * @remarks
				 * To be extended by universe.
				 *
				 * @param this - Universe object container
				 * @param args - Args provided by
				 * @returns Map of universe objects
				 */
				value(
					this: ThisInstanceConcrete,
					// Args here to preserve types
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					...args: GenerateParams
				): CoreArgsWithMapContainerArg<ChildUniverseObjectInstance, ChildId, Options> {
					return new Map();
				}
			}
		},
		staticAssign: {}
	};

	/**
	 * Prototype chain will be changed to add new methods, and injected with type information.
	 *
	 * @remarks
	 * The injection for non-static properties can be only done as properties, not methods. Thus, for overrides, classes extending this would have to use assignment of functions to properties, instead of defining methods directly.
	 *
	 * To ensure proper inheritance, assignment of members is done via prototype.
	 *
	 * Currently, dynamic generic abstract properties are impossible to define.
	 */
	abstract class UniverseObjectContainer
		extends (Base as ConcreteConstructor<SuperParams>)
		implements StaticImplements<ClassImplements, typeof UniverseObjectContainer>
	{
		/**
		 * Public constructor.
		 *
		 * @param args - Mixin args
		 */
		public constructor(...args: ConstructorParams) {
			// Call super constructor
			// ESLint does not like casting on `extends`
			// eslint-disable-next-line constructor-super
			super(...args);

			// Assign properties
			// Within context of the class, `this` is not seen as `ThisInstanceConcrete` yet
			computedClassGenerate({ args: [], members, that: this as unknown as ThisInstanceConcrete });
		}
	}

	// Set prototype
	computedClassAssign({ Base: UniverseObjectContainer, members });

	// Return
	return UniverseObjectContainer as ReturnClass;
}
// #endregion
