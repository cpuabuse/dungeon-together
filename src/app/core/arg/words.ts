/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Words and constraints for universe objects
 */

import { CoreArgIds } from ".";

/**
 * Generic constraint for exhaustiveness of universe object IDs.
 */
type CoreArgWordsDefinition<
	T extends {
		[K in CoreArgIds]: string;
	}
> = T;

/**
 * Non-exhaustive words used for singular forms of universe objects.
 *
 * An extra variable is necessary for exhaustiveness verification.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const argSingularWordsNonExhaustive = {
	[CoreArgIds.Shard]: CoreArgIds.Shard,
	[CoreArgIds.Grid]: CoreArgIds.Grid,
	[CoreArgIds.Cell]: CoreArgIds.Cell,
	[CoreArgIds.Entity]: CoreArgIds.Entity
} as const;

/**
 * Words used for singular forms of universe objects.
 */
const argSingularWords: CoreArgWordsDefinition<typeof argSingularWordsNonExhaustive> = argSingularWordsNonExhaustive;

/**
 * Non-exhaustive words used for plural forms of universe objects.
 *
 * An extra variable is necessary for exhaustiveness verification.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const argPluralWordsNonExhaustive = {
	[CoreArgIds.Shard]: "shards",
	[CoreArgIds.Grid]: "grids",
	[CoreArgIds.Cell]: "cells",
	[CoreArgIds.Entity]: "entities"
} as const;

/**
 * Words used for plural forms of universe objects.
 */
const argPluralWords: CoreArgWordsDefinition<typeof argPluralWordsNonExhaustive> = argPluralWordsNonExhaustive;

/**
 * All related words for universe objects.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
export const coreArgObjectWords = Object.values(CoreArgIds).reduce(
	(result, universeObjectId) => {
		/**
		 * Makes string capitalized.
		 *
		 * @param param - Destructured parameter
		 * @returns Capitalized string
		 */
		function toCapitalized<T extends string>({
			text
		}: {
			/**
			 * Text to capitalize.
			 */
			text: string;
		}): Capitalize<T> {
			return `${[...text][0].toUpperCase()}${text.slice(1)}` as Capitalize<T>;
		}

		return {
			...result,
			[universeObjectId]: {
				pluralCapitalizedWord: toCapitalized({ text: argPluralWords[universeObjectId].toLowerCase() }),
				pluralLowercaseWord: argPluralWords[universeObjectId].toLowerCase(),
				singularCapitalizedWord: toCapitalized({ text: argSingularWords[universeObjectId] }),
				singularLowercaseWord: argSingularWords[universeObjectId].toLowerCase()
			}
		};
	},
	{} as {
		[K in CoreArgIds]: {
			/**
			 * Lowercase singular form of the word.
			 */
			singularLowercaseWord: typeof argSingularWords[K];

			/**
			 * Capitalized singular form of the word.
			 */
			singularCapitalizedWord: Capitalize<typeof argSingularWords[K]>;

			/**
			 * Lowercase plural form of the word.
			 */
			pluralLowercaseWord: typeof argPluralWords[K];

			/**
			 * Capitalized plural form of the word.
			 */
			pluralUppercaseWord: Capitalize<typeof argPluralWords[K]>;
		};
	}
);

/**
 * All the words for core universe objects.
 */
export type CoreArgObjectWords = typeof coreArgObjectWords;
