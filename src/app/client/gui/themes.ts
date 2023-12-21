/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Defines themes
 */

// TODO: Move and add a prefix
/**
 * Enum for theme identification.
 *
 * @remarks
 * Cannot contain value of {@link systemThemeLiteral}.
 */
export enum Theme {
	Dark = "dark",
	Light = "light"
}

/**
 * String to represent system theme (dark/light), that is not in {@link Theme}.
 */
// Infer stirng type
// eslint-disable-next-line @typescript-eslint/typedef
export const systemThemeLiteral = "system" as const;
