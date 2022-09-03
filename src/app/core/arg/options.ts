/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition
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
	 * Use paths or not, complex option.
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
 * Identifiers for path option values.
 */
export enum CoreArgComplexOptionPathIds {
	Id = "id",
	Own = "own",
	Extended = "extended"
}

/**
 * Key name for storing default values in complex options.
 */
// `as const` assignment
// eslint-disable-next-line @typescript-eslint/typedef
const defaultSymbolKey = "default" as const;

/**
 * Type of default key name for complex options.
 */
type DefaultSymbolKey = typeof defaultSymbolKey;

/**
 * Symbol representing value of ID type path option.
 */
const PathIdSymbol: unique symbol = Symbol(CoreArgComplexOptionPathIds.Id);

/**
 * Symbol representing value of own type path option.
 */
const PathOwnSymbol: unique symbol = Symbol(CoreArgComplexOptionPathIds.Own);

/**
 * Symbol representing value of extended type path option.
 */
const PathExtendedSymbol: unique symbol = Symbol(CoreArgComplexOptionPathIds.Extended);

// Infer for simplicity
// eslint-disable-next-line @typescript-eslint/typedef
/**
 * Index representing association of path option value to path option id.
 */
// Inferring type for better type checking
// eslint-disable-next-line @typescript-eslint/typedef
export const coreArgComplexOptionSymbolIndex = {
	[CoreArgOptionIds.Path]: {
		[defaultSymbolKey]: PathOwnSymbol,
		[CoreArgComplexOptionPathIds.Id]: PathIdSymbol,
		[CoreArgComplexOptionPathIds.Own]: PathOwnSymbol,
		[CoreArgComplexOptionPathIds.Extended]: PathExtendedSymbol
	}
} as const;

/**
 * Type of complex option value index.
 */
export type CoreArgComplexOptionSymbolIndex = typeof coreArgComplexOptionSymbolIndex;

/**
 * Union of all complex option values per option.
 */
type CoreArgComplexOptionValues = {
	[K in keyof CoreArgComplexOptionSymbolIndex]: CoreArgComplexOptionSymbolIndex[K][keyof CoreArgComplexOptionSymbolIndex[K]];
};

/**
 * Union of all complex option IDs.
 */
type CoreArgComplexOptionIds = keyof CoreArgComplexOptionSymbolIndex;

/**
 * Union of all complex option values.
 */
type CoreArgComplexOptionSymbols = CoreArgComplexOptionValues[keyof CoreArgComplexOptionValues];

/**
 * Union of all simple option IDs.
 */
type CoreArgSimpleOptionIds = Exclude<CoreArgOptionIds, CoreArgComplexOptionIds>;

/**
 * Generate strict option type for the given ids.
 */
export type CoreArgOptionsGenerate<I extends CoreArgSimpleOptionIds, S extends CoreArgComplexOptionSymbols = never> = {
	[K in CoreArgComplexOptionIds]: {
		// Checking if no unions per option
		[D in keyof CoreArgComplexOptionSymbolIndex[K]]: CoreArgComplexOptionSymbolIndex[K][D] extends S &
			CoreArgComplexOptionValues[K]
			? S & CoreArgComplexOptionValues[K] extends CoreArgComplexOptionSymbolIndex[K][D]
				? true
				: false
			: true;
	}[keyof CoreArgComplexOptionSymbolIndex[K]];
}[CoreArgComplexOptionIds] extends true
	? CoreArgOptionsUnionGenerate<
			I,
			Exclude<CoreArgSimpleOptionIds, I>,
			// `CoreArgOptionsUnionGenerate` symbols parameter
			{
				[K in CoreArgComplexOptionIds]: {
					// `never` if `S` doesn't match
					[D in keyof CoreArgComplexOptionSymbolIndex[K]]: CoreArgComplexOptionSymbolIndex[K][D] extends S &
						CoreArgComplexOptionValues[K]
						? CoreArgComplexOptionSymbolIndex[K][D]
						: never;
				}[keyof CoreArgComplexOptionSymbolIndex[K]] extends never
					? // If `never`, provide default
					  CoreArgComplexOptionSymbolIndex[K][DefaultSymbolKey]
					: // Otherwise extract value from `S`
					  S & CoreArgComplexOptionValues[K];
			}[CoreArgComplexOptionIds]
	  >
	: never;

/**
 * Constrained generic argument constraint for options.
 * Not to be used for actual variables.
 * Not to be used directly as a generic constraint, only to be used in a separate type alias, so that TS engine processes the options properly.
 *
 * Argument `I` represents a predefined ID that is true, and `D`, respectively false. Same IDs cannot be given to both `I` and `D`.
 */
export type CoreArgOptionsUnionGenerate<
	I extends CoreArgSimpleOptionIds = never,
	D extends Exclude<CoreArgSimpleOptionIds, I> = never,
	S extends CoreArgComplexOptionSymbols = never
> = {
	[K in CoreArgSimpleOptionIds]: K extends I ? true : K extends D ? false : boolean;
} & {
	// Disable distribution on `I` via tuple
	[K in CoreArgComplexOptionIds]: CoreArgComplexOptionValues[K] & ([S] extends [never] ? unknown : S);
};

/**
 * Generates union operand for override.
 */
type CoreArgOptionsOverrideUnionOperand<
	I extends CoreArgSimpleOptionIds = never,
	D extends Exclude<CoreArgSimpleOptionIds, I> = never,
	S extends CoreArgComplexOptionSymbols = never
> = {
	[K in I]: true;
} & {
	[K in D]: false;
} & {
	[K in CoreArgComplexOptionIds as CoreArgComplexOptionValues[K] & S extends never ? never : K]: K & S;
};

/**
 * Overrides options with given values.
 */
export type CoreArgOptionsOverride<
	O extends CoreArgOptionsUnion,
	I extends CoreArgSimpleOptionIds = never,
	D extends Exclude<CoreArgSimpleOptionIds, I> = never,
	S extends CoreArgComplexOptionSymbols = never
> = {
	[K in CoreArgSimpleOptionIds | CoreArgComplexOptionIds]: (K extends keyof CoreArgOptionsOverrideUnionOperand<I, D, S>
		? CoreArgOptionsOverrideUnionOperand<I, D, S>[K]
		: O[K]) &
		CoreArgOptionsUnionGenerate<I, D, S>[K];
};

/**
 * Generic argument constraint for any kind of options.
 * Not to be used for actual variables.
 */
export type CoreArgOptionsUnion = CoreArgOptionsUnionGenerate<never, never>;

/**
 * Function to generate a options objects, and corresponding types.
 *
 * If inappropriate symbols are given, `never` will be returned, so JS data consistency checks omitted.
 *
 * @param param - Destructured parameter
 * @returns Options object
 */
export function coreArgOptionIdsToOptions<I extends CoreArgSimpleOptionIds, S extends CoreArgComplexOptionSymbols>({
	idSet,
	symbolSet
}: {
	/**
	 * Set of core args ids.
	 */
	idSet: Set<I>;

	/**
	 * Set of symbols for complex options.
	 */
	symbolSet: Set<S>;
}): CoreArgOptionsGenerate<I, S> {
	// Interpreting set as a set of "CoreArgsOptionIds", to be able to call it's methods with "CoreArgsOptionIds", rather than just generic argument type
	const set: Set<CoreArgOptionIds | CoreArgComplexOptionSymbols> = idSet;
	return {
		...Object.values(CoreArgOptionIds).reduce((result, id) => ({ ...result, [id]: set.has(id) }), {}),
		// `Object.keys()` changes to string, so casting appropriately
		...(Object.keys(coreArgComplexOptionSymbolIndex) as Array<CoreArgComplexOptionIds>).reduce((result, id) => {
			const symbolSetArray: Array<S> = Array.from(symbolSet);
			const symbolIndexArray: Array<
				CoreArgComplexOptionSymbolIndex[typeof id][keyof CoreArgComplexOptionSymbolIndex[typeof id]]
			> = Object.values(coreArgComplexOptionSymbolIndex[id]);

			return {
				...result,
				[id]: ((): S => {
					for (let i: number = 0; i < symbolSet.size; i++) {
						if (symbolIndexArray.includes(symbolSetArray[i])) {
							return symbolSetArray[i];
						}
					}

					// If not found, return default
					// Casting, since `S` could have been extended from TS perspective
					return coreArgComplexOptionSymbolIndex[id][defaultSymbolKey] as S;
				})()
			};
		}, {})
	} as CoreArgOptionsGenerate<I, S>;
}
