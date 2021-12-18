/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object common definitions
 */

import { Uuid } from "../../common/uuid";
import { CoreUniverseObjectArgsIndex, CoreUniverseObjectArgsIndexAccess } from "../args-index";
import { CoreUniverseObjectArgsContainer } from "./args";
import {
	CoreUniverseObjectPath,
	CoreUniverseObjectPathUuidPropertyName,
	coreUniverseObjectIdToPathUuidPropertyName
} from "./path";
import { CoreUniverseObjectIds, CoreUniverseObjectWords, coreUniverseObjectWords } from "./words";
import { CoreUniverseObjectArgsOptionsUnion } from ".";

/**
 * Factory for core universe object class.
 *
 * Args generic parameters cannot be replaced with index, since universe object information will not be extracted from index, as ID information will be lost, if not passed to an index from within this function.
 *
 * @returns Universe object class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectContainerFactory<
	C extends abstract new (...args: any[]) => any,
	N extends CoreUniverseObjectArgsIndex<O>,
	I extends CoreUniverseObjectIds,
	O extends CoreUniverseObjectArgsOptionsUnion
>({
	Base,
	universeObjectId,
	// Potentially to be used in the future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	options,
	isUniverse,
	universePropertyName
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
	 * Extracting args type from index.
	 */
	type Args = CoreUniverseObjectArgsIndexAccess<N, I, O>;

	const {
		pluralLowercaseWord,
		singularCapitalizedWord
	}: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreUniverseObjectWords[I]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreUniverseObjectWords[I]["singularCapitalizedWord"];
	} = coreUniverseObjectWords[universeObjectId];

	/**
	 * Name of universe objects member.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const nameUniverseObjects = `${pluralLowercaseWord}` as const;

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
	 * UUID property name within a path.
	 */
	const pathUuidPropertyName: CoreUniverseObjectPathUuidPropertyName<I> = coreUniverseObjectIdToPathUuidPropertyName({
		universeObjectId
	});

	// Inferring for final type
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		addUniverseObject: {
			name: nameAddUniverseObject,
			/**
			 * Add universe object with the map option.
			 *
			 * @param this - Universe object container
			 * @param universeObject - Universe object to add
			 */
			value(this: CoreUniverseObjectContainerInstance, universeObject: Args): void {
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
			value(this: CoreUniverseObjectContainerInstance, path: CoreUniverseObjectPath<I>): Args | undefined {
				let universeObject: Args | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);
				return universeObject;
			}
		},
		universeObjects: {
			name: nameUniverseObjects,
			value: new Map<Uuid, Args>()
		}
	};

	/**
	 * Type of members.
	 */
	type Members = typeof members;

	/**
	 * Instance type for class.
	 *
	 * Keys are manually set to dodge circular type dependencies.
	 */
	type CoreUniverseObjectContainerInstance = {
		[K in typeof nameAddUniverseObject as K]: Members["addUniverseObject"]["value"];
	} & {
		[K in typeof nameGetUniverseObject as K]: Members["getUniverseObject"]["value"];
	} & {
		[K in typeof nameUniverseObjects as K]: Members["universeObjects"]["value"];
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
	abstract class CoreUniverseObjectContainer extends Base {}

	// Set prototype
	Object.values(members).forEach(member => {
		(CoreUniverseObjectContainer.prototype as Record<string, unknown>)[member.name] = member.value;
	});

	/**
	 * Class type for return injection.
	 */
	type CoreUniverseObjectContainerInstanceClass = typeof CoreUniverseObjectContainer &
		(abstract new (...args: any[]) => CoreUniverseObjectContainerInstance);

	// Generic computed property is not preserved in class type, so manually injecting, by extracting signature from class
	// Conditionally checking if class is appropriately extending args container
	return CoreUniverseObjectContainer as CoreUniverseObjectContainerInstance extends CoreUniverseObjectArgsContainer<
		I,
		O
	>
		? CoreUniverseObjectContainerInstanceClass
		: never;
}
