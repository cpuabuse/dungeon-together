/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Ladder.
 *
 * @file
 */

import { Nav } from "../../app/core/arg";
import { ActionWords } from "../../app/server/action";
import { EntityKindActionArgs, EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

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
		 * Entity dictionary.
		 *
		 * @returns Entity dictionary
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, hasLocalAction: true };
		}

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}

		/**
		 * Override action.
		 *
		 * @param param - Destructured parameter
		 * @returns True if action was handled
		 */
		// Ladder does not require modification
		// eslint-disable-next-line class-methods-use-this
		public action({ action, sourceEntity }: EntityKindActionArgs): boolean {
			switch (action) {
				case ActionWords.Use:
					if (sourceEntity) {
						sourceEntity.kind.navigateEntity({ nav: Nav.ZUp });
					} else {
						return false;
					}
					return true;

				default:
					return false;
			}
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
