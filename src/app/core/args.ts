/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

/**
 * Identifiers for option strings.
 */
export enum CoreArgsIds {
	/**
	 * Navigation.
	 */
	Nav = "nav",

	/**
	 * Vector.
	 */
	Vector = "vector",

	/**
	 * Path.
	 */
	Path = "path",

	/**
	 * Kind.
	 */
	Kind = "kind",

	/**
	 * To use maps or arrays.
	 */
	Map = "map"
}

/**
 * Generate strict option type for the given ids.
 */
export type CoreArgsIdsToOptions<I extends CoreArgsIds> = {
	[K in CoreArgsIds]: K extends I ? true : false;
};

/**
 * Options on which core operates.
 *
 * To be used as a type for actual variables.
 */
export type CoreArgsOptions = CoreArgsIdsToOptions<never>;

/**
 * All the option possibilities.
 *
 * Not to be used for actual variables, to be used for generic argument constraints instead.
 *
 * Argument `T` represents a predefined ID that is true, and `F`, respectively false. Same IDs cannot be given to both T and F.
 */
export type CoreArgsOptionsUnion<T extends CoreArgsIds = never, F extends Exclude<CoreArgsIds, T> = never> = {
	[K in CoreArgsIds]: K extends T ? true : K extends F ? false : boolean;
};

/**
 * Function to generate a options objects, and corresponding types.
 *
 * @returns Options object
 */
export function coreArgsIdsToOptions<I extends CoreArgsIds>({
	idsSet
}: {
	/**
	 * Set of core args ids.
	 */
	idsSet: Set<I>;
}): CoreArgsIdsToOptions<I> {
	// Interpreting set as a set of "CoreArgsIds", to be able to call it's methods with "CoreArgsIds", rather than just generic argument type
	const set: Set<CoreArgsIds> = idsSet;
	return Object.values(CoreArgsIds).reduce(
		(result, id) => ({ ...result, [id]: set.has(id) }),
		{} as CoreArgsIdsToOptions<I>
	);
}
