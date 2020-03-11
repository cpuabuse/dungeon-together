/*
	File: src/app/common/types.ts
	cpuabuse.com
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
