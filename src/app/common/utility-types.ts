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
export type StaticImplements<I extends abstract new (...args: any[]) => any, C extends I> = InstanceType<I>;

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
		 * Key-value pairs.
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
 * Maybe defined, maybe undefined partial.
 * Creates a type conditionally.
 * To be used for destructured optional parameters.
 *
 * If condition is true, returns the type, otherwise returns partial with undefined properties.
 */
export type MaybeDefined<
	DefinedCondition extends boolean,
	T extends Record<string, any>
> = DefinedCondition extends true
	? T
	: {
			[K in keyof T]?: never;
	  };

/**
 * Creates a constructor, to be used in module.
 */
type Constructor<
	IsAbstract extends boolean = true,
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	Instance extends object = any,
	Parameters extends any[] = any
> = IsAbstract extends true ? abstract new (...args: Parameters) => Instance : new (...args: Parameters) => Instance;

/**
 * Any constructor, to be used as constraints for utility types. Any constructor, concrete or abstract will extend this.
 */
export type AnyConstructor = Constructor;

/**
 * Any constructor.
 */
// "{}" is needed exactly, to preserve instance type and to be able to extend
// eslint-disable-next-line @typescript-eslint/ban-types
export type ConcreteConstructorConstraint<Instance extends {} = {}> = Constructor<false, Instance>;

/**
 * Any constructor, that is abstract.
 */
// "{}" is needed exactly, to preserve instance type and to be able to extend
// eslint-disable-next-line @typescript-eslint/ban-types
export type AbstractConstructorConstraint<Instance extends {} = {}> = Constructor<true, Instance>;

/**
 * Creates a constructor.
 */
// "{}" is needed exactly, to preserve instance type and to be able to extend
// eslint-disable-next-line @typescript-eslint/ban-types
export type ConcreteConstructor<Parameters extends any[] = any[], Instance extends {} = {}> = Constructor<
	false,
	Instance,
	Parameters
>;

/**
 * Creates an abstract constructor.
 */
// "{}" is needed exactly, to preserve instance type and to be able to extend
// eslint-disable-next-line @typescript-eslint/ban-types
export type AbstractConstructor<Parameters extends any[] = any[], Instance extends {} = {}> = Constructor<
	true,
	Instance,
	Parameters
>;

/**
 * Gets static members from a class, omitting constructor.
 */
export type StaticMembers<T extends AnyConstructor> = Omit<T, "new">;
