/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import Color from "color";
import { Palette } from "../common/color";

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
 * Type representing colors in an HP bar.
 */
export type HpBarColors = Palette<typeof hpBarColorWords>;

/**
 * Friendly HP bar colors.
 */
export const friendlyHpBarColors: HpBarColors = {
	accent: new Color("#8de805"),
	background: new Color("#003d0a"),
	border: new Color("#191a23"),
	foregroundMain: new Color("#36e30b"),
	foregroundSecondary: new Color("#014c01")
};

/**
 * Neutral HP bar colors.
 */
export const neutralHpBarColors: HpBarColors = {
	accent: new Color("#051de8"),
	background: new Color("#1f003d"),
	border: new Color("#0c031a"),
	foregroundMain: new Color("#360be3"),
	foregroundSecondary: new Color("#1c014c")
};

/**
 * Enemy HP bar colors.
 */
export const enemyHpBarColors: HpBarColors = {
	accent: new Color("#e80c05"),
	background: new Color("#3d1600"),
	border: new Color("#1a1c03"),
	foregroundMain: new Color("#e3360b"),
	foregroundSecondary: new Color("#4d1601")
};
