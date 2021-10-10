/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

/**
 * Generates interface with boolean constraint.
 */
type ToBooleanProperties<T extends string> = {
	[K in T]: boolean;
};

/**
 * Args options generic type constraints.
 *
 * `nav` is for navigation.
 *
 * @example
 * ```typescript
 * interface Options extends CoreArgsOptionsImplements<Options> {
 *   // ...
 * }
 * ```
 */
export type CoreArgsOptions = ToBooleanProperties<"nav">;

/**
 * Implementation constraint for args options.
 * 1. In `O extends CoreArgsOptions`, `O` has all the properties of `CoreArgsOptions`, as boolean
 * 1. In `CoreArgsOptions[K] extends O[K] ? never : O[K]`, `never` will be produced if `O[K]` is boolean, which will not be extended in `interface Options extends CoreArgsOptionsImplements<Options>`
 */
export type ArgsOptionsImplements<O extends CoreArgsOptions> = {
	[K in keyof CoreArgsOptions]: CoreArgsOptions[K] extends O[K] ? never : O[K];
};
