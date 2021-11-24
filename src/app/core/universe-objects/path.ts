/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { Uuid } from "../../common/uuid";
import { CoreUniverseObjectIds, CoreUniverseObjectWords } from "./words";

/**
 * Universe object path constraint.
 */
export type CoreUniverseObjectPath<I extends CoreUniverseObjectIds> = {
	[K in `${CoreUniverseObjectWords[I]["singularLowercaseWord"]}Uuid` as K]: Uuid;
};
