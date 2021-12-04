/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file CRUD operations for the universe objects
 */

import { CoreArgsIds, CoreArgsIdsToOptions, CoreArgsOptions, CoreArgsOptionsUnion } from "../args";
import { CoreUniverseObjectArgsContainerMemberUniverseObjects, CoreUniverseObjectArgsIndex } from "./args";
import { coreUniverseObjectIdToPathUuidPropertyName } from "./path";
import { CoreUniverseObjectIds, coreUniverseObjectWords } from "./words";

/**
 * This factory is not for universe objects themselves, but is for usage/implementation of CRUD of the universe objects, within the target class.
 * Hence, no generic class constructor constraint.
 *
 * @returns Universe object class.
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CoreUniverseObjectContainerCrudFactory<
	C extends abstract new (...args: any[]) => any,
	I extends CoreUniverseObjectIds,
	O extends CoreArgsOptionsUnion = CoreArgsOptions
>({
	Base,
	universeObjectId,
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
	const {
		pluralLowercaseWord,
		singularCapitalizedWord
	}: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: typeof coreUniverseObjectWords[I]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: typeof coreUniverseObjectWords[I]["singularCapitalizedWord"];
	} = coreUniverseObjectWords[universeObjectId];

	/**
	 * Name of universe objects member.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const mUniverseObjects = `${pluralLowercaseWord}` as const;

	/**
	 * Name of add universe object function.
	 */
	// Need to extract type
	// eslint-disable-next-line @typescript-eslint/typedef
	const mAddUniverseObject = `add${singularCapitalizedWord}` as const;

	/**
	 * Universe object container args with a map.
	 */
	type UniverseObjectsWithMap = CoreUniverseObjectArgsContainerMemberUniverseObjects<
		I,
		CoreArgsIdsToOptions<CoreArgsIds.Map>
	>;

	/**
	 * Universe object container args without a map.
	 */
	type UniverseObjectsWithoutMap = CoreUniverseObjectArgsContainerMemberUniverseObjects<I, CoreArgsIdsToOptions<never>>;

	/**
	 * Methods assigned from in the constructor are accessible from subclasses.
	 */
	abstract class CoreUniverseObjectContainerCrud extends Base {
		/**
		 * Universe objects.
		 */
		// Member type can not be inferred from generics
		private universeObjects: CoreUniverseObjectArgsContainerMemberUniverseObjects<I, O> = (options.map === true
			? new Map()
			: new Array()) as CoreUniverseObjectArgsContainerMemberUniverseObjects<I, O>;

		/**
		 * Constructor.
		 *
		 * @param args - Mixin empty arguments
		 */
		// Constructor argument must be of specific type
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		public constructor(...args: any[]) {
			super();

			// Assign public computed members
			this[mUniverseObjects as string] = this.universeObjects;
			this[mAddUniverseObject as string] =
				// This determination is required
				// eslint-disable-next-line @typescript-eslint/unbound-method
				options.map === true ? this.addUniverseObjectWithMap : this.addUniverseObjectWithoutMap;
		}

		/**
		 * Add universe object with the map option.
		 *
		 * @param universeObject - Universe object to add
		 */
		private addUniverseObjectWithMap(
			universeObject: CoreUniverseObjectArgsIndex<I, CoreArgsIdsToOptions<CoreArgsIds.Map>>
		): void {
			(this.universeObjects as UniverseObjectsWithMap).set(
				universeObject[coreUniverseObjectIdToPathUuidPropertyName({ universeObjectId })],
				universeObject
			);
		}

		/**
		 * A function adding a universe object to the container, without the map.
		 *
		 * @param universeObject - The universe object to add
		 */
		private addUniverseObjectWithoutMap(
			universeObject: CoreUniverseObjectArgsIndex<I, CoreArgsIdsToOptions<never>>
		): void {
			(this.universeObjects as UniverseObjectsWithoutMap).push(universeObject);
		}
	}

	// Generic computed property is not preserved in class type, so manually injecting, by extracting signature from class
	return CoreUniverseObjectContainerCrud as unknown as typeof CoreUniverseObjectContainerCrud &
		(new (...args: any[]) => {
			[K in typeof mUniverseObjects as K]: CoreUniverseObjectContainerCrud["universeObjects"];
		} &
			{
				[K in typeof mAddUniverseObject as K]: O[CoreArgsIds.Map] extends true
					? CoreUniverseObjectContainerCrud["addUniverseObjectWithMap"]
					: CoreUniverseObjectContainerCrud["addUniverseObjectWithoutMap"];
			});
}
