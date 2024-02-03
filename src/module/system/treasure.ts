/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Treasure.
 *
 * @file
 */

import { ActionWords } from "../../app/server/action";
import { ServerCell } from "../../app/server/cell";
import { EntityKindActionArgs, EntityKindClass, ServerEntityClass } from "../../app/server/entity";

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
		 *  Whether the treasure is open.
		 */
		public isOpen: boolean = false;

		/**
		 * Closed mode UUID.
		 */
		protected readonly closedModeUuid: string = "mode/user/treasure/default";

		/**
		 * Open mode UUID.
		 */
		protected readonly openModeUuid: string = "treasure-open";

		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, hasAction: !this.isOpen };
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether the action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Use: {
					this.isOpen = !this.isOpen;
					if (this.isOpen) {
						this.entity.modeUuid = this.openModeUuid;
					} else {
						this.entity.modeUuid = this.closedModeUuid;
					}
					return true;
				}

				// Player attacks treasure entity and makes it disappear
				case ActionWords.Attack: {
					super.action({ action, ...rest });
					let cell: ServerCell = (this.entity.constructor as ServerEntityClass).universe.getCell(this.entity);
					cell.addEvent({ name: "death", targetEntityUuid: this.entity.entityUuid });
					cell.removeEntity(this.entity);
					return true;
				}

				case ActionWords.Interact: {
					return this.action({ action: ActionWords.Use, ...rest });
				}

				default:
					return super.action({ action, ...rest });
			}
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
