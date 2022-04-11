/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe definitions
 */

import { CoreArgIds, CoreArgObjectWords, CoreArgOptionsPathOwn, CoreArgPath } from "../arg";

/**
 * A universe constraint from perspective of universe object.
 */
export type CoreUniverseObjectUniverse<
	Id extends CoreArgIds,
	ParentIds extends CoreArgIds,
	Path extends CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>
> = {
	[K in Id as `get${CoreArgObjectWords[K]["singularCapitalizedWord"]}`]: (path: Path) => unknown;
};
