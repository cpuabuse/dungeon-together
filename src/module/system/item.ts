/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 *
 * Item.
 */

import { ActionWords } from "../../app/server/action";
import { ServerCell } from "../../app/server/cell";
import { EntityKindActionArgs, EntityKindClass, ServerEntityClass } from "../../app/server/entity";

/**
 * Item kind factory.
 *
 * @param param - Destructured parameter
 * @returns Item kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ItemKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Item class.
	 */
	class ItemKind extends Base {
		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Pickup:
					// TODO: Implement pickup
					return true;

				case ActionWords.Drop:
					// TODO: Implement drop
					return true;

				case ActionWords.Interact:
					// TODO: Add conditional pickup or drop
					return true;

				default:
					return super.action(param);
			}
		}
	}

	/**
	 * Items that can be counted.
	 */
	class CountableItemKind extends ItemKind {
		/**
		 * Getter of internal amount of items.
		 *
		 * @returns Amount of internal items
		 */
		public get amount(): number {
			return this.internalAmount;
		}

		/**
		 * Setter of internal amount of items.
		 */
		public set amount(value: number) {
			this.internalAmount = value;
			if (this.internalAmount <= 0) {
				this.destroy();
			}
		}

		/**
		 * Amount of internal items.
		 */
		private internalAmount: number = 3;

		/**
		 * Emits amount.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, amount: this.amount };
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Interact: {
					return this.action({ action: ActionWords.Pickup, ...rest });
				}

				case ActionWords.Pickup:
					this.amount = 0;
					return true;

				default:
					return super.action(param);
			}
		}

		/**
		 * Destroys item, removing it from the cell, when picked up.
		 */
		public destroy(): void {
			let cell: ServerCell = (this.entity.constructor as ServerEntityClass).universe.getCell(this.entity);
			cell.addEvent({ name: "pickup", targetEntityUuid: this.entity.entityUuid });
			cell.removeEntity(this.entity);
		}
	}

	/**
	 * Resources of the game.
	 */
	class ResourceKind extends CountableItemKind {}

	/**
	 * Gold.
	 */
	class GoldKind extends ResourceKind {}

	return {
		CountableItemKind,
		GoldKind,
		ItemKind,
		ResourceKind
	};
}
