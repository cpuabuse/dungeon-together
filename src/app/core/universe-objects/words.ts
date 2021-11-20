/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Words and constraints for universe objects
 */

import { CoreCellWord } from "../cell";
import { CoreEntityWord } from "../entity";
import { CoreGridWord } from "../grid";
import { CoreShardWord } from "../shard";

/**
 * Identifiers for a universe objects' members.
 */
export enum CoreUniverseObjectIds {
	Shard = "shard",
	Grid = "grid",
	Cell = "cell",
	Entity = "entity"
}

/**
 * Generic constraint for exhaustiveness of universe object IDs.
 */
type CoreUniverseObjectWordDefinitions<
	T extends {
		[K in CoreUniverseObjectIds]: string;
	}
> = T;

/**
 * Non-exhaustive words used for singular forms of universe objects.
 *
 * An extra variable is necessary for exhaustiveness verification.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const universeObjectSingularWordsNonExhaustive = {
	[CoreUniverseObjectIds.Shard]: CoreUniverseObjectIds.Shard,
	[CoreUniverseObjectIds.Grid]: CoreUniverseObjectIds.Grid,
	[CoreUniverseObjectIds.Cell]: CoreUniverseObjectIds.Cell,
	[CoreUniverseObjectIds.Entity]: CoreUniverseObjectIds.Entity
} as const;

/**
 * Words used for singular forms of universe objects.
 */
const universeObjectSingularWords: CoreUniverseObjectWordDefinitions<typeof universeObjectSingularWordsNonExhaustive> =
	universeObjectSingularWordsNonExhaustive;

/**
 * Non-exhaustive words used for plural forms of universe objects.
 *
 * An extra variable is necessary for exhaustiveness verification.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const universeObjectPluralWordsNonExhaustive = {
	[CoreUniverseObjectIds.Shard]: "shards",
	[CoreUniverseObjectIds.Grid]: "grids",
	[CoreUniverseObjectIds.Cell]: "cells",
	[CoreUniverseObjectIds.Entity]: "entities"
} as const;

/**
 * Words used for plural forms of universe objects.
 */
const universeObjectPluralWords: CoreUniverseObjectWordDefinitions<typeof universeObjectPluralWordsNonExhaustive> =
	universeObjectPluralWordsNonExhaustive;

/**
 * All related words for universe objects.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
export const coreUniverseObjectWords = Object.values(CoreUniverseObjectIds).reduce(
	(result, universeObjectId) => {
		/**
		 * Makes string capitalized.
		 *
		 * @returns Capitalized string
		 */
		function toCapitalized<T extends string>({
			text
		}: {
			/**
			 * Text to capitalize.
			 */
			text: string;
		}): Capitalize<Lowercase<T>> {
			return `${[...text][0].toUpperCase()}${text.slice(1).toLowerCase()}` as Capitalize<Lowercase<T>>;
		}

		return {
			...result,
			[universeObjectId]: {
				pluralCapitalizedWord: toCapitalized({ text: universeObjectPluralWords[universeObjectId].toLowerCase() }),
				pluralLowercaseWord: universeObjectPluralWords[universeObjectId].toLowerCase(),
				singularCapitalizedWord: toCapitalized({ text: universeObjectSingularWords[universeObjectId] }),
				singularLowercaseWord: universeObjectSingularWords[universeObjectId].toLowerCase()
			}
		};
	},
	{} as {
		[K in CoreUniverseObjectIds]: {
			/**
			 * Lowercase singular form of the word.
			 */
			singularLowercaseWord: Lowercase<typeof universeObjectSingularWords[K]>;

			/**
			 * Capitalized singular form of the word.
			 */
			singularCapitalizedWord: Capitalize<typeof universeObjectSingularWords[K]>;

			/**
			 * Lowercase plural form of the word.
			 */
			pluralLowercaseWord: Lowercase<typeof universeObjectPluralWords[K]>;

			/**
			 * Capitalized plural form of the word.
			 */
			pluralUppercaseWord: Capitalize<Lowercase<typeof universeObjectPluralWords[K]>>;
		};
	}
);

/**
 * All the words for core universe objects.
 */
export type CoreUniverseObjectWords = typeof coreUniverseObjectWords;
