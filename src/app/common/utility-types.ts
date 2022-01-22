/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Various common utility types.
 */

/**
 * Returns the instance type of `I` and makes sure `C` extends `I`.
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
export type FromAbstract<C extends abstract new (...args: any[]) => any> = C extends abstract new (
	...args: infer A
) => infer R
	? Omit<C, "new"> & (new (...args: A) => R)
	: never;

/**
 * Destructured params from constructor.
 */
export type DestructureParameters<C extends new (...args: any[]) => any> = ConstructorParameters<C>[0];

/**
 * Typescript safe way of determining if property exists.
 *
 * Cannot destructure - {@link https://github.com/microsoft/TypeScript/issues/41173}.
 *
 * @param obj - Target object
 * @param prop - Property name
 * @example
 * ```
 * let obj = {
 * 	value: 5;
 * }: {
 * 	value: string;
 * };
 *
 * if (hasOwnProperty(obj, "value")) {
 * 	// ...
 * }
 * ```
 *
 * @returns Has own property or not
 */
export function hasOwnProperty<K extends string, P>(
	/**
	 * Object to check.
	 */
	// We actually expect a wide range of types
	// eslint-disable-next-line @typescript-eslint/ban-types
	obj: {
		/**
		 *
		 */
		[E in K]?: P;
	},

	/**
	 * Property of string literal type.
	 */
	prop: K
): obj is { [E in K]: P } {
	return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Creates a type conditionally.
 *
 * If condition is true, returns the type, otherwise returns partial with undefined properties.
 */
export type MaybeDefined<
	DefinedCondition extends boolean,
	T extends Record<string, any>
> = DefinedCondition extends true ? T : Partial<T> & Record<string, never>;
