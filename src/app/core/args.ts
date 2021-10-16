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
 * Minimal possible args options configuration.
 */
export type CoreArgsMinimalOptions = CoreArgsIdsToOptions<never>;

/**
 * All the option possibilities.
 *
 * Not to be used for actual variables, to be used for generic argument constraints instead.
 */
export type CoreArgsOptionsUnion = {
	[K in CoreArgsIds]: boolean;
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
