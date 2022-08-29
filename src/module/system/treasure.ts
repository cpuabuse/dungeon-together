/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Treasure.
 *
 * @file
 */

import { EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

/**
 * Treasure kind factory.
 *
 * @param param - Destructured parameter
 * @returns Treasure kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TreasureKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Treasure.
	 */
	class TreasureKind extends Base {
		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}
	return TreasureKind;
}

/**
 * Treasure class.
 */
export type TreasureKindClass = ReturnType<typeof TreasureKindClassFactory>;

/**
 * Treasure kind.
 */
export type TreasureKind = InstanceType<TreasureKindClass>;
