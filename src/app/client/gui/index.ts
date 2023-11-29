/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for vue definitions
 */

import { ExhaustiveUnion } from "../../common/utility-types";
import { ClientCell } from "../cell";

/**
 * Reexport.
 */
export { createVueApp } from "./vue.app";

/**
 * Words for right-click menu data type.
 */
export enum ClientUniverseStateRcMenuDataWords {
	Cell = "cell",
	Empty = "empty"
}

/**
 * Right-click menu data.
 */
export type ClientUniverseStateRcMenuData =
	| null
	| (ExhaustiveUnion<
			| {
					/**
					 * Cell type.
					 */
					type: ClientUniverseStateRcMenuDataWords.Cell;

					/**
					 * Cell link.
					 */
					cell: ClientCell;
			  }
			| {
					/**
					 * Empty type.
					 *
					 * @remarks
					 * Display when no context given.
					 */
					type: ClientUniverseStateRcMenuDataWords.Empty;
			  },
			"type",
			ClientUniverseStateRcMenuDataWords
	  > & {
			/**
			 * Pixel position on "x".
			 */
			x: number;

			/**
			 * Pixel position on "y".
			 */
			y: number;
	  });
