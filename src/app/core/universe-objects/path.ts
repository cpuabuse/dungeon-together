/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { Uuid } from "../../common/uuid";
import { CoreUniverseObjectIds, CoreUniverseObjectWords, coreUniverseObjectWords } from "./words";

/**
 * A type for the property name of path UUID.
 */
type CoreUniverseObjectPathUuidPropertyName<I extends CoreUniverseObjectIds> =
	`${CoreUniverseObjectWords[I]["singularLowercaseWord"]}Uuid`;

/**
 * Universe object path constraint.
 */
export type CoreUniverseObjectPath<I extends CoreUniverseObjectIds> = {
	[K in CoreUniverseObjectPathUuidPropertyName<I> as K]: Uuid;
};

/**
 * Generate a name for path property.
 *
 * @returns The name of the path property
 */
export function coreUniverseObjectIdToPathUuidPropertyName<I extends CoreUniverseObjectIds>({
	universeObjectId
}: {
	/**
	 * ID of the universe object.
	 */
	universeObjectId: I;
}): CoreUniverseObjectPathUuidPropertyName<I> {
	// Casting to remove union
	return `${coreUniverseObjectWords[universeObjectId].singularLowercaseWord}Uuid` as CoreUniverseObjectPathUuidPropertyName<I>;
}
