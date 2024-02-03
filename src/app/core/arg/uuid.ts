/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Arg UUIDs.
 *
 * @file
 */

import { separator } from "../../common/url";
import { Uuid } from "../../common/uuid";
import { coreGenerateUuid } from "../uuid";
import { CoreArgIds } from "./arg";
import { coreArgObjectWords } from "./words";

/**
 * Generates unique ID-based UUID.
 *
 * @param param - Destructured parameter
 * @returns New UUID
 */
export function coreArgGenerateDefaultUuid<Id extends CoreArgIds>({
	id,
	uuid,
	universeUuid
}: {
	/**
	 * Id.
	 */
	id: Id;

	/**
	 * UUID.
	 */
	uuid: Uuid;

	/**
	 * Universe UUID.
	 */
	universeUuid: Uuid;
}): Uuid {
	return coreGenerateUuid({
		namespace: coreArgObjectWords[id].pluralLowercaseWord,
		path: `${universeUuid}${separator}${uuid}`
	});
}
