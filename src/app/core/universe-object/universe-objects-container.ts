/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object common definitions
 */

import { ComputedClassExtract } from "../../common/computed-class";
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

// #region Members
/**
 * Members injected by class.
 */
type InjectMembers<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = {
	[K in `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
		this: ConcreteInstance<ChildUniverseObject, ChildId, Options, ParentIds>,
		universeObject: ChildUniverseObject
	) => void;
} & {
	[K in `get${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
		this: ConcreteInstance<ChildUniverseObject, ChildId, Options, ParentIds>,
		path: CoreArgPath<ChildId, Options, ParentIds>
	) => ChildUniverseObject;
} & {
	[K in `remove${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}`]: (
		this: ConcreteInstance<ChildUniverseObject, ChildId, Options, ParentIds>,
		path: CoreArgPath<ChildId, Options, ParentIds>
	) => void;
};
// #endregion

// #region Class types
/**
 * Concrete instance.
 */
type ConcreteInstance<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArgsContainer<ChildUniverseObject, ChildId, Options, ParentIds> &
	InjectMembers<ChildUniverseObject, ChildId, Options, ParentIds>;

/**
 * Abstract part ot the class from {@link CoreUniverseObjectContainerFactory}.
 *
 * @typeParam ChildUniverseObject - Universe object to contain
 * @typeParam ChildId - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @typeParam ParentIds - Parent IDs of the universe object
 */
export type CoreUniverseObjectContainerImplements<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = {
	[K in CoreArgObjectWords[ChildId]["singularCapitalizedWord"] as `default${K}`]: ChildUniverseObject;
	// Included to remove ts errors since `C` is not used.
};

/**
 * Universe object container final type.
 */
export type CoreUniverseObjectContainer<
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = ConcreteInstance<ChildUniverseObject, ChildId, Options, ParentIds> &
	CoreUniverseObjectContainerImplements<ChildUniverseObject, ChildId, Options, ParentIds>;
// #endregion

// #region Factory
/**
 * Factory for core universe object class.
 *
 * Args generic parameters cannot be replaced with index, since universe object information will not be extracted from index, as ID information will be lost, if not passed to an index from within this function.
 *
 * @remarks
 * Classes extending this must implement {@link CoreUniverseObjectContainerImplements}. Should be implemented anywhere in the chain, including up to first concrete class once. For simplicity, the first class to extends this should implement {@link CoreUniverseObjectContainerImplements}.
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
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	BaseClass extends abstract new (...args: any[]) => {},
	ChildUniverseObject extends CoreUniverseObject<ChildId, Options, ParentIds>,
	ChildId extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
>({
	Base,
	universeObjectId,
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
	universeObjectId: ChildId;

	/**
	 * Args options.
	 */
	options: Options;
}) {
	/**
	 * `this` for class methods.
	 */
	type ThisInstance = ConcreteInstance<ChildUniverseObject, ChildId, Options, ParentIds> & UniverseObjectContainer;

	/**
	 * Instance for this inside of class methods, that include abstract members from {@link CoreUniverseObjectContainerAbstract}.
	 */
	type AbstractInstance = ThisInstance &
		CoreUniverseObjectContainerImplements<ChildUniverseObject, ChildId, Options, ParentIds>;

	/**
	 * Class type for return injection.
	 *
	 * Conditionally checking if class is appropriately extending arg container and injection is properly implemented. This is what makes sure {@link CoreUniverseObjectContainer} is safe to use.
	 */
	type ReturnClass = ComputedClassExtract<typeof members> extends ConcreteInstance<
		ChildUniverseObject,
		ChildId,
		Options,
		ParentIds
	>
		? typeof UniverseObjectContainer & (abstract new (...args: any[]) => ComputedClassExtract<typeof members>)
		: never;

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
	} = coreArgObjectWords[universeObjectId];

	// Need to extract types
	/* eslint-disable @typescript-eslint/typedef */
	const nameAddUniverseObject = `add${singularCapitalizedWord}` as const; // Name of add universe object function
	const nameGetUniverseObject = `get${singularCapitalizedWord}` as const; // Name of get universe object function
	const nameRemoveUniverseObject = `remove${singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
	const nameAbstractDefaultUniverseObject = `default${singularCapitalizedWord}` as const; // Name of default universe object
	/* eslint-enable @typescript-eslint/typedef */
	const pathUuidPropertyName: CoreArgPathUuidPropertyName<ChildId> = coreArgIdToPathUuidPropertyName({
		id: universeObjectId
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
				value(this: ThisInstance, universeObject: ChildUniverseObject): void {
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
				value(this: ThisInstance, path: CoreArg<ChildId, Options, ParentIds>): ChildUniverseObject {
					let universeObject: ChildUniverseObject | undefined = this[nameUniverseObjects].get(
						path[pathUuidPropertyName]
					);
					return universeObject === undefined
						? (this as AbstractInstance)[nameAbstractDefaultUniverseObject]
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
				value(this: ThisInstance, path: CoreArgPath<ChildId, Options, ParentIds>): void {
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
	abstract class UniverseObjectContainer extends Base {
		/**
		 * Public constructor.
		 *
		 * @param args - Mixin args
		 */
		public constructor(...args: any[]) {
			// Call super constructor
			super(args);

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
