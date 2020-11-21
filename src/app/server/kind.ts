/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Kinds.
 */

import { ServerEntity } from "./server-entity";

/**
 * An interface like thing kind, only requiring certain kinds to be there.
 */
export interface Kind {
	/**
	 * Literally, kind class.
	 */
	typeOfThing: typeof ServerEntity;
}
