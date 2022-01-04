/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

/**
 * Identifiers for option strings.
 */
export enum CoreArgOptionIds {
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
	Map = "map",

	/**
	 * To generate a new UUID for children or not.
	 *
	 * - `false`: Use the UUID provided
	 * - `true`: Generate a new UUID from data
	 */
	UUID = "uuid"
}

/**
 * Generate strict option type for the given ids.
 */
export type CoreArgOptionIdsToOptions<I extends CoreArgOptionIds> = {
	[K in CoreArgOptionIds]: K extends I ? true : false;
};

/**
 * Constrained generic argument constraint for options.
 * Not to be used for actual variables.
 * Not to be used directly as a generic constraint, only to be used in a separate type alias, so that TS engine processes the options properly.
 *
 * Argument `T` represents a predefined ID that is true, and `F`, respectively false. Same IDs cannot be given to both T and F.
 */
export type CoreArgOptionsUnionGenerate<
	T extends CoreArgOptionIds = never,
	F extends Exclude<CoreArgOptionIds, T> = never
> = {
	[K in CoreArgOptionIds]: K extends T ? true : K extends F ? false : boolean;
};

/**
 * Generic argument constraint for any kind of options.
 * Not to be used for actual variables.
 */
export type CoreArgOptionsUnion = CoreArgOptionsUnionGenerate<never, never>;

/**
 * Function to generate a options objects, and corresponding types.
 *
 * @returns Options object
 */
export function coreArgOptionIdsToOptions<I extends CoreArgOptionIds>({
	idSet
}: {
	/**
	 * Set of core args ids.
	 */
	idSet: Set<I>;
}): CoreArgOptionIdsToOptions<I> {
	// Interpreting set as a set of "CoreArgsOptionIds", to be able to call it's methods with "CoreArgsOptionIds", rather than just generic argument type
	const set: Set<CoreArgOptionIds> = idSet;
	return Object.values(CoreArgOptionIds).reduce(
		(result, id) => ({ ...result, [id]: set.has(id) }),
		{} as CoreArgOptionIdsToOptions<I>
	);
}

/**
 * Core arg options with map.
 */
export type CoreArgOptionsWithMap = CoreArgOptionIdsToOptions<CoreArgOptionIds.Map>;

/**
 * Core arg options without map.
 */
export type CoreArgOptionsWithoutMap = CoreArgOptionIdsToOptions<never>;
