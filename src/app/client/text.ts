/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Client text operations.
 *
 * @file
 */

/**
 * Creates printable name from UUID as fallback.
 *
 * @param param - Destructured object
 * @returns Printable string
 */
export function uuidToName({ uuid }: Record<"uuid", string>): string {
	return uuid.substring(0, 8);
}
