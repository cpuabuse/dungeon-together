/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Trap.
 *
 * @file
 */

import { ActionWords } from "../../app/server/action";
import {
	EntityKindActionArgs,
	EntityKindClass,
	EntityKindConstructorParams,
	ServerEntity
} from "../../app/server/entity";
import { UnitKindClass } from "./unit";

/**
 * Trap kind factory.
 *
 * @param param - Destructured parameter
 * @returns Trap kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TrapKindClassFactory({
	Targets = [],
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;

	/**
	 * Targets for the trap.
	 */
	Targets?: Array<UnitKindClass>;
}) {
	/**
	 * Actual trap. The player can fall or loose HP depending on the trap class (spike/hole)
	 */
	class TrapKind extends Base {
		/**
		 * The damage the trap can cause to the player.
		 */
		public damage: number = 0;

		/** Whether the trap activates. */
		public isActive: boolean = false;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}

		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits };
		}

		/**
		 * Will be called once another entity is attached to the same cell.
		 *
		 * @param entity - Entity that was attached to the cell
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public onCellAttachEntity(entity: ServerEntity): void {
			super.onCellAttachEntity(entity);

			if (!this.isActive && Targets.some(Target => entity.kind instanceof Target)) {
				// Activate trap
				this.isActive = true;

				// Change the mode of the trap
				this.entity.modeUuid = "trap-activate";

				// Attack the target entity
				entity.kind.action({
					action: ActionWords.Attack,
					sourceEntity: this.entity
				});
			}

			this.randomizeVisibility();
		}

		/**
		 * Randomly changes the visibility of the trap.
		 */
		public randomizeVisibility(): void {
			this.isVisible = Math.random() > 0.5;
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
