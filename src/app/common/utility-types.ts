/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Various common utility types.
 */

/**
 * Returns the instance type of `I` and makes sure `C` extends `I`
 */
// `C extends I` to show which properties are missing in errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type StaticImplements<I extends new (...args: any[]) => any, C extends I> = InstanceType<I>;

/**
 * Converts a class to abstract version.
 *
 * Omit is required, since new constructor extends abstract constructor.
 */
export type ToAbstract<C extends new (...args: any[]) => any> = C extends new (...args: infer A) => infer R
	? Omit<C, "new"> & (abstract new (...args: A) => R)
	: never;

/**
 * Converts an abstract class to non-abstract version.
 */
export type FromAbstract<C extends abstract new (...args: any) => any> = C & (new (...args: any) => any);

/**
 * Destructured params from constructor.
 */
export type DestructureParameters<C extends new (args: any) => any> = ConstructorParameters<C>[0];
