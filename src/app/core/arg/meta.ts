/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { Path } from "../../common/path";
import { CoreArgIds, CoreArgOptionIds, CoreArgOptionsUnion, CoreArgWithoutPath, CoreArgWithoutPathDefined } from ".";

/**
 * Metadata for arg.
 *
 * The parent UUID is not included, as the hierarchy of metadata will represent arg hierarchy, of which this type should have no knowledge about. (What if conversion happens from one file to another?)
 */
export type CoreArgMeta<O extends CoreArgOptionsUnion, N extends CoreArgIds[]> = O[CoreArgOptionIds.Path] extends true
	? unknown
	: {
			/**
			 * Base URL.
			 */
			baseUrl: URL;

			/**
			 * Default path.
			 */
			index: number;

			/**
			 * User defined path.
			 */
			userPath: Path;
	  } & (N extends [CoreArgIds, ...infer D]
			? // Always should extend, necessary as a constraint to use D as a type parameter
			  D extends CoreArgIds[]
				? {
						/**
						 * Parent meta and ID.
						 */
						parentMeta: CoreArgMeta<O, D>;

						/**
						 * Parent path.
						 */
						parentPath: D extends [] ? CoreArgWithoutPathDefined : CoreArgWithoutPath;
				  }
				: never
			: unknown);
