/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Uuid interfaces.
 */

import { appUrl } from "./defaults";
import { v5 } from "uuid";

/**
 * Alias for uuid.
 */
export type Uuid = string;

/**
 * Generates default UUID.
 */
export function getDefaultUuid({ path }: { path: string }): Uuid {
	return v5(`${appUrl}/${path}`, v5.URL);
}
