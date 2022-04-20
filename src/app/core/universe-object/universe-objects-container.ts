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
import { CoreUniverseObject, CoreUniverseObjectArgsOptionsUnion } from ".";

/**
 * Data for class constraint.
 */
type CoreUniverseObjectContainerClassConstraintData<
	// Child without children or parents
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	BaseClass extends ConcreteConstructorConstraint = ConcreteConstructorConstraint
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
			[K in `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				universeObject: ChildUniverseObject
			) => void;
		} & {
			[K in `get${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options>
			) => ChildUniverseObject;
		} & {
			[K in `remove${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options>
			) => void;
		} & CoreArgsContainer<ChildUniverseObject, ChildId, Options>;

		/**
		 * Abstract.
		 */
		[ComputedClassWords.Implement]: {
			[K in CoreArgObjectWords[ChildId]["singularCapitalizedWord"] as `default${K}`]: ChildUniverseObject;
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
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	Base extends ConcreteConstructorConstraint = ConcreteConstructorConstraint
> = ComputedClassDataExtends<
	CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options, Base>
>;

/**
 * Abstract part ot the class from {@link CoreUniverseObjectContainerFactory}.
 *
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 */
export type CoreUniverseObjectContainerClassImplements<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion
> = ComputedClassClassImplements<CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options>>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainerClass<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion
> = ComputedClassClassConstraint<CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options>>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainer<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion
> = InstanceType<CoreUniverseObjectContainerClass<ChildUniverseObject, ChildId, Options>>;

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
	// It is irrelevant if child has grandchildren or not (same for parent)
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion
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
	type BaseParams = ConstructorParameters<BaseClass>;

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParams = BaseParams;

	/**
	 * Actual class info.
	 */
	type ActualClassInfo = ComputedClassInfo<
		CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options>,
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
				[ComputedClassWords.Inject]: ComputedClassExtractInstance<typeof members>;

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
	const nameAddUniverseObject = `add${singularCapitalizedWord}` as const; // Name of add universe object function
	const nameGetUniverseObject = `get${singularCapitalizedWord}` as const; // Name of get universe object function
	const nameRemoveUniverseObject = `remove${singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
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
			addUniverseObject: {
				name: nameAddUniverseObject,
				/**
				 * Add universe object with the map option.
				 *
				 * @param this - Universe object container
				 * @param universeObject - Universe object to add
				 */
				value(this: ThisInstanceConcrete, universeObject: ChildUniverseObject): void {
					this[nameUniverseObjects].set(universeObject[pathUuidPropertyName], universeObject);
				}
			},
			getUniverseObject: {
				name: nameGetUniverseObject,
				/**
				 * Get universe object.
				 *
				 * @param this - Universe object container
				 * @param path - Path to search for
				 * @returns Universe object
				 */
				value(this: ThisInstanceConcrete, path: CoreArg<ChildId, Options>): ChildUniverseObject {
					let universeObject: ChildUniverseObject | undefined = this[nameUniverseObjects].get(
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
				 * @param this - Universe object container
				 * @returns Map of universe objects
				 */
				value(this: ThisInstanceConcrete): CoreArgsWithMapContainerArg<ChildUniverseObject, ChildId, Options> {
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
		extends (Base as ConcreteConstructor<BaseParams>)
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
