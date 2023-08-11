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
import { CellEvent } from "../../server/cell";

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
			events: Array<CellEvent>;

			/**
			 * Grid UUID.
			 */
			gridUuid: Uuid;

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
