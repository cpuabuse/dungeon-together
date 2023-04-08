/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Uuid } from "../../common/uuid";
import { ActionWords } from "../../server/action";

/**
 * Types for overlay container.
 *
 * @file
 */

/**
 * Words used for UI action.
 */
export enum OverlayContainerUiActionWords {
	EntityAction = "entityAction",
	EntityInfo = "entityInfo"
}

/**
 * Helper type for UI action, guarantees exhaustiveness, and constraints.
 */
type OverlayContentUiActionHelper<
	T extends {
		/**
		 * UI action.
		 */
		uiActionType: OverlayContainerUiActionWords;
	}
> = OverlayContainerUiActionWords extends T["uiActionType"] ? T : never;

/**
 * Possible word/parameters combination for UI action.
 */
export type OverlayContentUiActionParam = OverlayContentUiActionHelper<
	| {
			/**
			 * UI action.
			 */
			uiActionType: OverlayContainerUiActionWords.EntityAction;

			/**
			 * Action type.
			 */
			entityActionType: ActionWords;

			/**
			 * Target entity UUID.
			 */
			targetEntityUuid: Uuid;
	  }
	| {
			/**
			 * Entity info.
			 */
			uiActionType: OverlayContainerUiActionWords.EntityInfo;

			/**
			 * Information to display.
			 */
			targetEntityUuid: Uuid;
	  }
>;
