/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Graphics.
 */

import { WritableComputedRef, watch } from "vue";
import { useDisplay } from "vuetify";
import { defaultFps, defaultMobileFps, maxFps } from "../../common/graphics";
import { Store, StoreWord } from "./store";

/**
 * That is how we address FPS in record store.
 */
export const fpsRecordId: symbol = Symbol("fps");

/**
 * Graphics store.
 *
 * @param param - Destructured parameters
 * @returns FPS composable
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGraphics({
	isRoot = false,
	recordStore,
	universeStore
}: {
	/**
	 * Whether this is run from the root of the application. Should only be run as root once.
	 */
	isRoot?: boolean;

	/**
	 * Record store.
	 */
	recordStore: Store<StoreWord.Record>;

	/**
	 * Universe store.
	 */
	universeStore: Store<StoreWord.Universe>;
}) {
	/**
	 * Changes FPS for each shard.
	 *
	 * @param value - FPS to set
	 */
	function changeFps(value: number): void {
		universeStore.universe.shards.forEach(shard => {
			shard.setFps({ fps: value });
		});
	}

	const fps: WritableComputedRef<number> = recordStore.computedRecord({
		defaultValue: 60,

		id: fpsRecordId,
		/**
		 * Checks FPS record.
		 *
		 * @param value - Record value
		 * @returns Whether the value is a valid FPS
		 */
		validator(value: unknown): value is number {
			return typeof value === "number" && value > 0 && value < maxFps;
		}
	});

	// Run only once
	if (isRoot) {
		// Change FPS on record change, and addition of shards
		watch(fps, changeFps);
		universeStore.onUpdateUniverse({
			// ESLint does not infer void return
			// eslint-disable-next-line jsdoc/require-returns
			/**
			 * Callback to change FPS.
			 */
			callback: (): void => {
				changeFps(fps.value);
			}
		});

		// Set initial FPS
		fps.value = useDisplay().mobile.value ? defaultMobileFps : defaultFps;
	}

	return { fps };
}
