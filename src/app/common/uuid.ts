/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Uuid interfaces.
 */

import { URL } from "url";
import { appUrl } from "./defaults";
import { v5 } from "uuid";

/**
 * Alias for uuid.
 */
export type Uuid = string;

/**
 * Generates default UUID.
 * @throws [[URL]] generates errors
 */
export function getDefaultUuid({ base = appUrl, path }: { base?: string; path: string }): Uuid {
	let url: URL = new URL(path, base);
	return v5(url.href, v5.URL);
}
