/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 */

/**
 * Assign part of members.
 */
export type ComputedClassAssign = {
	[K in "assign"]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			name: string;

			/**
			 * Value to assign.
			 */
			value: unknown;
		};
	};
};

/**
 * Generate part of members.
 */
export type ComputedClassGenerate<P extends any[] = any[]> = {
	[K in "generate"]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			name: string;

			/**
			 * Generation function.
			 */
			value: (...arg: P) => unknown;
		};
	};
};

/**
 * Type to extract members for the class.
 *
 * @remarks
 * For some reason, some information is lost if not using two subtypes.
 */
export type ComputedClassExtract<
	T extends ComputedClassAssign | ComputedClassGenerate | (ComputedClassAssign & ComputedClassGenerate),
	P extends any[] = any[]
> = (T extends ComputedClassAssign
	? {
			[K in keyof T["assign"] as T["assign"][K]["name"]]: T["assign"][K]["value"];
	  }
	: unknown) &
	(T extends ComputedClassGenerate
		? // Check that generation params match
		  T extends ComputedClassGenerate<P>
			? {
					[K in keyof T["generate"] as T["generate"][K]["name"]]: ReturnType<T["generate"][K]["value"]>;
			  }
			: never
		: unknown);
