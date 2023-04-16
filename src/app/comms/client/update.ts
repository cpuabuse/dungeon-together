/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Update communication.
 *
 * @file
 */

import { Uuid } from "../../common/uuid";
import { Vector } from "../../common/vector";
import { CoreDictionary } from "../../core/connection";

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
				emits: CoreDictionary;

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
