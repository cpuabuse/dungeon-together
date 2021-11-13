/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { Uuid } from "../../common/uuid";

/**
 * Universe object path constraint.
 */
export type CoreUniverseObjectPath = {
	[key: string]: Uuid;
};
