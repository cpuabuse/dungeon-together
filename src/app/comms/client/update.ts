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

/**
 * Updating cells.
 */
export type ClientUpdate = {
	/**
	 * Cells.
	 */
	cells: Array<{
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
		}>;
	}>;
};
