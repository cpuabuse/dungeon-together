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
export type StaticImplements<I extends AbstractConstructorConstraint, C extends I> = InstanceType<I>;

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
 *
 * @remarks
 * Any constructor, to be used as constraints for utility types. So that any constructor, concrete or abstract will extend this.
 */
type Constructor<
	IsAbstract extends boolean = true,
	// "{}" is needed exactly, to preserve instance type and to be able to extend
	// eslint-disable-next-line @typescript-eslint/ban-types
	Parameters extends any[] = any,
	Instance extends object = any
> = IsAbstract extends true ? abstract new (...args: Parameters) => Instance : new (...args: Parameters) => Instance;

/**
 * Concrete constructor constraint.
 *
 * @remarks
 * Parameter constraint stays as `any`, as generic conditional types will not be assignable to other constraints.
 */
export type ConcreteConstructorConstraint<Instance extends object = object> = Constructor<false, any, Instance>;

/**
 * Abstract constructor constraint.
 *
 * @remarks
 * Parameter constraint stays as `any`, as generic conditional types will not be assignable to other constraints.
 */
export type AbstractConstructorConstraint<Instance extends object = object> = Constructor<true, any, Instance>;

/**
 * Creates a constructor.
 */
export type ConcreteConstructor<Parameters extends any[] = any[], Instance extends object = object> = Constructor<
	false,
	Parameters,
	Instance
>;

/**
 * Creates an abstract constructor.
 */
export type AbstractConstructor<Parameters extends any[] = any[], Instance extends object = object> = Constructor<
	true,
	Parameters,
	Instance
>;

/**
 * Gets static members from a class, omitting constructor.
 *
 * Can be used in generics since TS 4.6.
 */
export type StaticMembers<T extends Constructor> = Omit<T, "new">;
