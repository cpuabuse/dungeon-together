/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Arg UUIDs.
 *
 * @file
 */

import { urlPathSeparator } from "../../common/defaults";
import { Uuid, getDefaultUuid } from "../../common/uuid";
import { CoreArgIds } from "./arg";
import { coreArgObjectWords } from "./words";

/**
 * @param param
 */
export function coreArgGenerateDefaultUuid<Id extends CoreArgIds>({
	id,
	uuid
}: {
	/**
	 * Id.
	 */
	id: Id;

	/**
	 * UUID.
	 */
	uuid: Uuid;
}): Uuid {
	return getDefaultUuid({
		path: `${coreArgObjectWords[id].pluralLowercaseWord}${urlPathSeparator}${uuid}`
	});
}
