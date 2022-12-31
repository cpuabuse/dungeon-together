/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Update communication.
 *
 * @file
 */

import { Uuid } from "../../common/uuid";
import { Vector } from "../../common/vector";

/**
 * Updating cells.
 */
export type ClientUpdate = {
	/**
	 * Cells.
	 */
	cells: Array<
		Vector & {
			/**
			 *  Cell UUID.
			 */
			cellUuid: Uuid;

			/**
			 * Cell events.
			 */
			events: Array<{
				/**
				 * Event name.
				 */
				name: string;

				/**
				 * Event target.
				 */
				target?: {
					/**
					 * Entity UUID.
					 */
					entityUuid: Uuid;
				};
			}>;

			/**
			 * Entities.
			 */
			entities: Array<{
				/**
				 * Entity UUID.
				 */
				entityUuid: Uuid;

				/**
				 * Health update.
				 */
				emits: Record<string, any>;

				/**
				 * Mode UUID.
				 */
				modeUuid: Uuid;

				/**
				 * World UUID.
				 */
				worldUuid: Uuid;
			}>;
		}
	>;
};
