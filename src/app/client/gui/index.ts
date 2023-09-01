/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for vue definitions
 */

import { Store } from "vuex";
import { ExhaustiveUnion } from "../../common/utility-types";
import { ClientCell } from "../cell";
import { ClientUniverse } from "../universe";
import { Theme } from "./themes";

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

/**
 * State type for vuex.
 */
export interface UniverseState {
	/**
	 * Reference to client universe instance.
	 */
	universe: ClientUniverse;

	/**
	 * If theme is light.
	 */
	theme: Theme;

	/**
	 * Records of various things.
	 */
	records: Record<string | symbol, any>;

	/**
	 * Right-click menu data.
	 */
	rcMenuData: ClientUniverseStateRcMenuData;
}

/**
 * Universe store.
 */
export type UniverseStore = Store<UniverseState>;

/**
 * Cast this to access store.
 */
export type ThisVueStore = {
	/**
	 * Vuex store.
	 */
	$store: UniverseStore;
};
