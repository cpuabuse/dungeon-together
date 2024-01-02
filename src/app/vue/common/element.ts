/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Macros related to HTML elements.
 *
 * @file
 */

/**
 * Size for the tab.
 */
export enum ElementSize {
	/**
	 * Small tab.
	 */
	Small = "sm",

	/**
	 * Medium tab.
	 */
	Medium = "md",

	/**
	 * Large tab.
	 */
	Large = "lg"
}

/**
 * Vector representing element's two dimensions.
 */
export type ElementVector = Record<"x" | "y", number>;
