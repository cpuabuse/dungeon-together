/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Text utility functions.
 *
 * @file
 */

/**
 * Makes string capitalized.
 *
 * @param param - Destructured parameter
 * @returns Capitalized string
 */
export function toCapitalized<T extends string>({
	text
}: {
	/**
	 * Text to capitalize.
	 */
	text: T;
}): Capitalize<T> {
	if (text.length === 0) return text as Capitalize<T>;

	// Guaranteed to have first element
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	return `${[...text][0]!.toUpperCase()}${text.slice(1)}` as Capitalize<T>;
}
