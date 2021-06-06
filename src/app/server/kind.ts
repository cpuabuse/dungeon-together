/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Kinds.
 */

import { ServerEntityClassConcrete } from "./entity";

/**
 * An interface like thing kind, only requiring certain kinds to be there.
 */
export interface Kind {
	/**
	 * Literally, kind class.
	 */
	typeOfEntity: ServerEntityClassConcrete;
}
