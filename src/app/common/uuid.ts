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
