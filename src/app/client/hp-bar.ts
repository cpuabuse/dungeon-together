/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Colord, colord } from "colord";

/**
 * @file HP bar display.
 */

/**
 * HP bar parts tuple.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const hpBarColorWords = ["background", "foregroundMain", "foregroundSecondary", "border", "accent"] as const;

/**
 * HP bar parts.
 */
type HpBarColorWords = typeof hpBarColorWords[number];

/**
 * Type representing colors in an HP bar.
 */
export type HpBarColors = {
	[K in HpBarColorWords]: Colord;
};

/**
 * Friendly HP bar colors.
 */
export const friendlyHpBarColors: HpBarColors = {
	accent: colord("#8de805"),
	background: colord("#003d0a"),
	border: colord("#191a23"),
	foregroundMain: colord("#36e30b"),
	foregroundSecondary: colord("#014c01")
};

/**
 * Neutral HP bar colors.
 */
export const neutralHpBarColors: HpBarColors = {
	accent: colord("#051de8"),
	background: colord("#1f003d"),
	border: colord("#0c031a"),
	foregroundMain: colord("#360be3"),
	foregroundSecondary: colord("#1c014c")
};

/**
 * Enemy HP bar colors.
 */
export const EnemyHpBarColors: HpBarColors = {
	accent: colord("#e80c05"),
	background: colord("#3d1600"),
	border: colord("#1a1c03"),
	foregroundMain: colord("#e3360b"),
	foregroundSecondary: colord("#4d1601")
};
