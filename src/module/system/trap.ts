/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Trap.
 *
 * @file
 */

import { EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

/**
 * Trap kind factory.
 *
 * @param param - Destructured parameter
 * @returns Trap kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TrapKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Actual trap. The player can fall or loose HP depending on the trap class (spike/hole)
	 */
	class TrapKind extends Base {
		/**
		 * The damage the trap can cause to the player.
		 */
		public damage: number = 0;

		/**
		 * The visibility of trap, wether its visible or not.
		 */
		public visible: boolean = true;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}
	return TrapKind;
}

/**
 * Trap class.
 */
export type TrapKindClass = ReturnType<typeof TrapKindClassFactory>;

/**
 * Trap kind.
 */
export type TrapKind = InstanceType<TrapKindClass>;
