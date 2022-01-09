/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Uuid interfaces.
 */

import { v5 } from "uuid";
import { appUrl } from "./defaults";
import { Path } from "./path";

/**
 * Alias for uuid.
 */
export type Uuid = string;

/**
 * Generates default UUID.
 *
 * @throws [[URL]] generates errors
 *
 * @returns UUID
 */
export function getDefaultUuid({
	base = appUrl,
	path
}: {
	/**
	 * Base URL.
	 */
	base?: URL;

	/**
	 * Path.
	 */
	path: Path;
}): Uuid {
	let url: URL = new URL(path, base);
	return v5(url.href, v5.URL);
}
