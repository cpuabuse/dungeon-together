/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import Color from "color";

/**
 * Colors.
 *
 * @file
 */

/**
 * Hex colors.
 */
export enum HexColors {
	Red = "#FF0000",
	Orange = "#FF8800",
	Yellow = "#FFFF00",
	White = "#FFFFFF",
	Black = "#000000"
}

/**
 * Color palette.
 */
export type Palette<Words extends readonly string[]> = {
	[K in Words[number]]: Color;
};
