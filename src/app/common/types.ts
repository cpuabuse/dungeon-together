/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Common types.
 */

/**
 * Type for requiring predefined keys.
 */
export type Default<Keys extends string, Type> = {
	[key: string]: Type;
} & {
	readonly [key in Keys]: Type;
};
