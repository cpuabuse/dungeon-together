/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Core UUID.
 *
 * @file
 */

import { appUrl, urlPathSeparator } from "../common/defaults";
import { UrlOrigin, UrlPath } from "../common/url";
import { Uuid, getDefaultUuid } from "../common/uuid";

/**
 * A function to use to generate all core UUIDs.
 *
 * @param param - Destructured parameter
 * @returns Resulting UUID
 */
export function coreGenerateUuid({
	origin = appUrl,
	path,
	namespace
}: {
	/**
	 * Base URL.
	 */
	origin?: UrlOrigin;

	/**
	 * Path.
	 */
	path: UrlPath;

	/**
	 * Namespace.
	 */
	namespace: UrlPath;
}): Uuid {
	return getDefaultUuid({ origin, path: `${namespace}${urlPathSeparator}${path}` });
}
