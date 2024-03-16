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
import { EntityKindActionArgs, EntityKindClass } from "../../app/server/entity";

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

				case ActionWords.Use: {
					// TODO: Implement use
					return true;
				}

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
		 * Amount of items.
		 */
		public amount: number = 1;

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
					// TODO: Implement stackable pickup
					return true;

				default:
					return super.action(param);
			}
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
