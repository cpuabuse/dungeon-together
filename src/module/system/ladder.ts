/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Ladder.
 *
 * @file
 */

import { EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

/**
 * Ladder kind factory.
 *
 * @param param - Destructured parameter
 * @returns Ladder kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LadderKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Ladder. The player can climb up or down.
	 */
	class LadderKind extends Base {
		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}
	return LadderKind;
}

/**
 * Ladder class.
 */
export type LadderKindClass = ReturnType<typeof LadderKindClassFactory>;

/**
 * Ladder kind.
 */
export type LadderKind = InstanceType<LadderKindClass>;
