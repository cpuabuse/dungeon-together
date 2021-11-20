/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file CRUD operations for the universe objects
 */

import { Uuid } from "../../common/uuid";
import { CoreArgsIds, CoreArgsOptions, CoreArgsOptionsUnion } from "../args";
import { CoreUniverseObjectIds, CoreUniverseObjectWords, coreUniverseObjectWords } from "./words";

/**
 * This factory is not for universe objects themselves, but is for usage/implementation of CRUD of the universe objects, within the target class.
 * Hence, no generic class constructor constraint.
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
	const singularLowercaseWord = coreUniverseObjectWords[universeObjectId].singularLowercaseWord as const;
	const pluralLowercaseWord = coreUniverseObjectWords[universeObjectId].pluralLowercaseWord as const;
	const {
		singularCapitalizedWord
	}: {
		/**
		 *
		 */
		singularCapitalizedWord: typeof coreUniverseObjectWords[I]["singularCapitalizedWord"];
	} = coreUniverseObjectWords[universeObjectId];

	/**
	 * Computed properties of CRUD concept for universe objects.
	 */
	type CoreUniverseObjectCrudComputed = {
		/**
		 * Add a new universe object.
		 */
		[K in "" as `add${CoreUniverseObjectWords[I]["singularCapitalizedWord"]}`]: (...args: any[]) => void;
	};

	/**
	 *
	 */
	const mUniverseObjects: string = pluralLowercaseWord;

	/**
	 *
	 */
	const mAddUniverseObject: string = `add${singularCapitalizedWord}`;

	/**
	 *
	 */
	type UniverseObject = any;

	/**
	 *
	 */
	abstract class CoreUniverseObjectContainerCrud extends Base {
		/**
		 *
		 */
		public [mUniverseObjects]: O[CoreArgsIds.Map] extends true ? Map<Uuid, UniverseObject> : Array<UniverseObject>;

		/**
		 * @param {...any} args
		 */
		public constructor(...args: any[]) {
			super();

			this[mAddUniverseObject] = this.mAddUniverseObject;
		}

		/**
		 * @param universeObject
		 */
		private mAddUniverseObject(universeObject: UniverseObject): void {}
	}

	// Generic computed property is not preserved in class type, so manually injecting, by extracting signature from class
	return CoreUniverseObjectContainerCrud as unknown as typeof CoreUniverseObjectContainerCrud &
		(new (...args: any[]) => {
			[K in `add${typeof singularCapitalizedWord}`]: CoreUniverseObjectContainerCrud["mAddUniverseObject"];
		});
}
