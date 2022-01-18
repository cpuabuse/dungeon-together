/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Uuid interfaces
 */

import { v5 } from "uuid";
import { appUrl } from "./defaults";
import { UrlOrigin, UrlPath } from "./url";

/**
 * Alias for uuid.
 */
export type Uuid = string;

/**
 * Generates default UUID.
 *
 * @throws [[URL]] generates errors
 * @returns UUID
 */
export function getDefaultUuid({
	origin: base = appUrl,
	path
}: {
	/**
	 * Base URL.
	 */
	origin?: UrlOrigin;

	/**
	 * Path.
	 */
	path: UrlPath;
}): Uuid {
	let url: URL = new URL(path, base);
	return v5(url.href, v5.URL);
}
