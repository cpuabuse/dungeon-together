/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file CRUD operations for the universe objects
 */

import { TypeOf } from "io-ts";
import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsIdsToOptions, CoreArgsOptions, CoreArgsOptionsUnion } from "../args";
import {
	CoreUniverseObjectArgs,
	CoreUniverseObjectArgsContainerMemberUniverseObjects,
	CoreUniverseObjectArgsIndex
} from "./args";
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
	 *
	 */
	Base: C;

	/**
	 *
	 */
	universeObjectId: I;

	/**
	 *
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
	const mUniverseObjects: string = pluralLowercaseWord;

	/**
	 * Name of add universe object function.
	 */
	const mAddUniverseObject: string = `add${singularCapitalizedWord}`;

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
		}

		/**
		 * A function adding a universe object to the container, without the map.
		 *
		 * @param universeObject - The universe object to add
		 */
		private addUniverseObjectWithoutMap(universeObject: CoreUniverseObjectArgs<I>): void {
			this.mAddUniverseObject;
		}

		/**
		 * @param universeObject
		 */
		private mAddUniverseObjectWithMap(
			universeObject: CoreUniverseObjectArgsIndex<CoreArgsIdsToOptions<CoreArgsIds.Map>>[I]
		): void {
			(this.universeObjects as UniverseObjectsWithMap).set(
				universeObject[coreUniverseObjectIdToPathUuidPropertyName({ universeObjectId })],
				universeObject
			);
			this.universeObjects as UniverseObjectsWithMap;
		}
	}

	// Generic computed property is not preserved in class type, so manually injecting, by extracting signature from class
	return CoreUniverseObjectContainerCrud as unknown as typeof CoreUniverseObjectContainerCrud &
		(new (...args: any[]) => {
			[K in `add${typeof singularCapitalizedWord}` as K]: CoreUniverseObjectContainerCrud["mAddUniverseObject"];
		});
}
