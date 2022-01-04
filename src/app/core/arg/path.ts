/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { Uuid } from "../../common/uuid";
import { CoreArgIds, CoreArgObjectWords, coreArgObjectWords } from ".";

/**
 * A type for the property name of path UUID.
 */
export type CoreArgPathUuidPropertyName<I extends CoreArgIds> = `${CoreArgObjectWords[I]["singularLowercaseWord"]}Uuid`;

/**
 * Universe object path constraint.
 */
export type CoreArgPath<I extends CoreArgIds> = {
	[K in CoreArgPathUuidPropertyName<I> as K]: Uuid;
};

/**
 * Generate a name for path property.
 *
 * @returns The name of the path property
 */
export function coreArgIdToPathUuidPropertyName<I extends CoreArgIds>({
	universeObjectId
}: {
	/**
	 * ID of the universe object.
	 */
	universeObjectId: I;
}): CoreArgPathUuidPropertyName<I> {
	// Casting to remove union
	return `${coreArgObjectWords[universeObjectId].singularLowercaseWord}Uuid` as CoreArgPathUuidPropertyName<I>;
}
