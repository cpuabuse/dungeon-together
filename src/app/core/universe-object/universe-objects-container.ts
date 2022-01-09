/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object common definitions
 */

import {
	CoreArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgPathUuidPropertyName,
	CoreArgsContainer,
	CoreArgsWithMapContainerArg,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreUniverseObject, CoreUniverseObjectArgsOptionsUnion } from ".";

/**
 * Abstract part ot the class from {@link CoreUniverseObjectContainerFactory}.
 */
export type CoreUniverseObjectContainerImplements<
	U extends CoreUniverseObject<I, O>,
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion
> = {
	[K in CoreArgObjectWords[I]["singularCapitalizedWord"] as `default${K}`]: U;
	// Included to remove ts errors since `C` is not used.
};

/**
 * Factory for core universe object class.
 *
 * Args generic parameters cannot be replaced with index, since universe object information will not be extracted from index, as ID information will be lost, if not passed to an index from within this function.
 *
 * @remarks
 * Classes extending this must implement {@link CoreUniverseObjectContainerImplements}. Should be implemented anywhere in the chain, including up to first concrete class once. For simplicity, the first class to extends this should implement {@link CoreUniverseObjectContainerImplements}.
 *
 * @returns Universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectContainerFactory<
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	C extends abstract new (...args: any[]) => {},
	U extends CoreUniverseObject<I, O>,
	I extends CoreArgIds,
	O extends CoreUniverseObjectArgsOptionsUnion
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
	Base: C;

	/**
	 * Universe object ID.
	 */
	universeObjectId: I;

	/**
	 * Args options.
	 */
	options: O;
}) {
	/**
	 * Members and their types.
	 */
	type Members = {
		[K in keyof typeof members["assign"]]: typeof members["assign"][K]["value"];
	} & {
		[K in keyof typeof members["generate"]]: ReturnType<typeof members["generate"][K]["value"]>;
	};

	/**
	 * Injection for instance type for class.
	 *
	 * Generic computed property is not preserved in class type, so manually injecting, by extracting signature from class
	 *
	 * @remarks
	 * - Made of properties and methods
	 * - Keys are manually set to dodge circular type dependencies
	 */
	type InjectionInstance = {
		[K in typeof nameUniverseObjects as K]: Members["universeObjects"];
	} & {
		[K in typeof nameAddUniverseObject as K]: Members["addUniverseObject"];
	} & {
		[K in typeof nameGetUniverseObject as K]: Members["getUniverseObject"];
	} & {
		[K in typeof nameRemoveUniverseObject as K]: Members["removeUniverseObject"];
	};

	/**
	 * "This" for class methods.
	 */
	type ThisInstance = InjectionInstance & UniverseObjectContainer;

	/**
	 * Instance for this inside of class methods, that include abstract members from {@link CoreUniverseObjectContainerAbstract}.
	 */
	type AbstractInstance = ThisInstance & CoreUniverseObjectContainerImplements<U, I, O>;

	/**
	 * Class type for return injection.
	 *
	 * Conditionally checking if class is appropriately extending arg container to make sure injected class type is properly implemented
	 */
	type ReturnClass = AbstractInstance extends CoreArgsContainer<U, I, O>
		? typeof UniverseObjectContainer & (abstract new (...args: any[]) => ThisInstance)
		: never;

	const {
		pluralLowercaseWord,
		singularCapitalizedWord
	}: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[I]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[I]["singularCapitalizedWord"];
	} = coreArgObjectWords[universeObjectId];

	/**
	 * Name of add universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameAddUniverseObject = `add${singularCapitalizedWord}` as const;

	/**
	 * Name of get universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameGetUniverseObject = `get${singularCapitalizedWord}` as const;

	/**
	 * Name of remove universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameRemoveUniverseObject = `remove${singularCapitalizedWord}` as const;

	/**
	 * Name of universe objects member.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameUniverseObjects = `${pluralLowercaseWord}` as const;

	/**
	 * Name of default universe object.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameAbstractDefaultUniverseObject = `default${singularCapitalizedWord}` as const;

	/**
	 * UUID property name within a path.
	 */
	const pathUuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({
		universeObjectId
	});

	/**
	 * Members of class.
	 *
	 * @remarks
	 * - There are implicit constraints of how the const should be structured, but will implicitly be type checked during usage
	 * - Cannot use abstract as `this`, as it will mismatch when `super` is called
	 */
	// Inferring for final type
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
				value(this: ThisInstance, universeObject: U): void {
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
				value(this: ThisInstance, path: CoreArg<I, O>): U {
					let universeObject: U | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);
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
				value(this: ThisInstance, path: CoreArg<I, O>): void {
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
				value: (): CoreArgsWithMapContainerArg<U, I, O> => new Map()
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
