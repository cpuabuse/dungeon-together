/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe objects
 */

import { CoreUniverseObjectCrud, CoreUniverseObjectWords } from "./crud";

/**
 * Default UUIDs are to be set by client/server universe objects, since they might be dependant on implementation. In core abstract class these members are abstract. Also, static method in a core abstract class should provide a default UUID.
 *
 * The universe object classes are to be abstract at core level, and concrete in client/server, so that client/server has more freedom in operating them. E.g. entity can be abstract class in server, with multiple concrete classes extending it, and client using a concrete entity class for all kinds of entities.
 *
 * @remarks
 * This is for documentation purposes only.
 */
export type CoreUniverseObjectInherit = never;

/**
 * Core universe object constraints.
 */
export type CoreUniverseObject<T extends CoreUniverseObjectWords> = CoreUniverseObjectCrud<T>;

/**
 * Identifiers for a universe objects' members.
 */
export enum UniverseObjectIds {
	Shard = "shard",
	Grid = "grid",
	Cell = "cell",
	Entity = "entity"
}

/**
 * Words used for singular forms of universe objects.
 *
 * Exhaustiveness verified when accessing it, in {@link universeObjectWords}.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const universeObjectSingularWords = {
	[UniverseObjectIds.Shard]: UniverseObjectIds.Shard,
	[UniverseObjectIds.Grid]: UniverseObjectIds.Grid,
	[UniverseObjectIds.Cell]: UniverseObjectIds.Cell,
	[UniverseObjectIds.Entity]: UniverseObjectIds.Entity
} as const;

/**
 * Words used for plural forms of universe objects.
 *
 * Exhaustiveness verified when accessing it, in {@link universeObjectWords}.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
const universeObjectPluralWords = {
	[UniverseObjectIds.Shard]: "shards",
	[UniverseObjectIds.Grid]: "grids",
	[UniverseObjectIds.Cell]: "cells",
	[UniverseObjectIds.Entity]: "entities"
} as const;

/**
 * All related words for universe objects.
 */
// Forcing inference
// eslint-disable-next-line @typescript-eslint/typedef
export const universeObjectWords = Object.values(UniverseObjectIds).reduce(
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
		[K in UniverseObjectIds]: {
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
