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
	ComputedClassExtractInstance,
	ComputedClassInfo,
	ComputedClassMembers,
	ComputedClassWords
} from "../../common/computed-class";
import { ConcreteConstructor, ConcreteConstructorConstraint, StaticImplements } from "../../common/utility-types";

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
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ComputedClassData<{
	/**
	 * Concrete injection and abstract members, no own members.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers & {
		/**
		 * Inject.
		 */
		[ComputedClassWords.Inject]: {
			[K in `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				universeObject: ChildUniverseObject
			) => void;
		} & {
			[K in `get${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options, ParentIds>
			) => ChildUniverseObject;
		} & {
			[K in `remove${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<ChildId, Options, ParentIds>
			) => void;
		} & CoreArgsContainer<ChildUniverseObject, ChildId, Options, ParentIds>;

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
	[ComputedClassWords.Static]: ComputedClassMembers;
}>;

/**
 * Data to be consumed when extending.
 */
export type CoreUniverseObjectContainerClassConstraintDataExtends<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ComputedClassDataExtends<
	CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options, ParentIds>
>;

/**
 * Abstract part ot the class from {@link CoreUniverseObjectContainerFactory}.
 *
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreUniverseObjectContainerClassImplements<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ComputedClassClassImplements<
	CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options, ParentIds>
>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainerClass<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ComputedClassClassConstraint<
	CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options, ParentIds>
>;

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainer<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = InstanceType<CoreUniverseObjectContainerClass<ChildUniverseObject, ChildId, Options, ParentIds>>;

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
 * @typeParam ParentIds - Parent IDs of the universe object
 * @param param - Destructured Parameter
 * @returns Universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectContainerFactory<
	BaseClass extends ConcreteConstructorConstraint,
	// It is irrelevant if child has grandchildren or not
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
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
		CoreUniverseObjectContainerClassConstraintData<ChildUniverseObject, ChildId, Options, ParentIds>,
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
				[ComputedClassWords.Base]: BaseClass;

				/**
				 * Members assigned via class block.
				 */
				[ComputedClassWords.Populate]: typeof UniverseObjectContainer;
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
				value(this: ThisInstanceConcrete, path: CoreArg<ChildId, Options, ParentIds>): ChildUniverseObject {
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
				value(this: ThisInstanceConcrete, path: CoreArgPath<ChildId, Options, ParentIds>): void {
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
				 * @returns Map of universe objects
				 */
				value: (): CoreArgsWithMapContainerArg<ChildUniverseObject, ChildId, Options, ParentIds> => new Map()
			}
		}
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
			Object.values(members.generate).forEach(property => {
				(this as Record<string, unknown>)[property.name] = property.value();
			});
		}
	}

	// Set prototype
	Object.values(members.assign).forEach(method => {
		(UniverseObjectContainer.prototype as Record<string, unknown>)[method.name] = method.value;
	});

	// Return
	return UniverseObjectContainer as ReturnClass;
}
// #endregion
