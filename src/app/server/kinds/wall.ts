/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Walls etc.
 */
import { EntityKindClassFactory, EntityKindConstructorParams } from "../entity/entity-kind";

/**
 * Wall entity kind.
 *
 * @param param - Destructured parameter
 * @returns New class
 */
// Parameters inferred
// eslint-disable-next-line @typescript-eslint/typedef
export const WallKindClassFactory: EntityKindClassFactory = function ({ Base }) {
	/**
	 * Wall entity kind class.
	 */
	return class WallKind extends Base {
		/**
		 * @override
		 */
		public static isStackable: boolean = false;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity }: EntityKindConstructorParams) {
			super({ entity });
		}
	};
};
