/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Graphics.
 */

import { useIntervalFn } from "@vueuse/core";
import { ComputedRef, WritableComputedRef, computed, watch } from "vue";
import { useDisplay } from "vuetify";
import { defaultFps, defaultMobileFps, maxFps } from "../../common/graphics";
import { UsedDevice } from "./device";
import { Store, StoreWord } from "./store";

/**
 * That is how we address FPS in record store.
 */
export const targetFpsRecordId: symbol = Symbol("fps");

/**
 * Average FPS record ID.
 */
export const averageFpsRecordId: symbol = Symbol("average-fps");

/**
 * Checks FPS record.
 *
 * @param value - Record value
 * @returns Whether the value is a valid FPS
 */
function validator(value: unknown): value is number {
	return typeof value === "number" && value > 0 && value < maxFps;
}

/**
 * Number of FPS data instances to average.
 *
 * @remarks
 * Should not be too large, to recover from initial FPS values fast.
 */
const averageFpsAmount: number = 3;

/**
 * Graphics store.
 *
 * @param param - Destructured parameters
 * @remarks
 * Average FPS is just an approximation, during the addition and removal of shards, otherwise it is close enough, which is solved with less overall interval(interval time multiplied by amount of data points).
 *
 * @returns FPS composable
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGraphics({
	isRoot = false,
	recordStore,
	universeStore,
	usedDevice
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

	/**
	 * Used device composable.
	 */
	usedDevice: UsedDevice;
}) {
	/**
	 * Changes FPS for each shard.
	 *
	 * @param value - FPS to set
	 */
	function changeFps(value: number): void {
		universeStore.universe.shards.forEach(shard => {
			shard.setFps({ targetFps: value });
		});
	}

	const targetFps: WritableComputedRef<number> = recordStore.computedRecord({
		defaultValue: 60,
		id: targetFpsRecordId,
		validator
	});

	const averageFps: ComputedRef<number> = computed(() =>
		recordStore.getRecord({
			defaultValue: 60,
			id: averageFpsRecordId,
			validator
		})
	);

	// For the current device, the FPS is different, mobile or desktop
	const defaultDeviceFps: ComputedRef<number> = computed(() =>
		usedDevice.isMobile.value ? defaultMobileFps : defaultFps
	);

	// Run only once
	if (isRoot) {
		// Change FPS on record change, and addition of shards
		watch(targetFps, changeFps);
		universeStore.onUpdateUniverse({
			// ESLint does not infer void return
			// eslint-disable-next-line jsdoc/require-returns
			/**
			 * Callback to change FPS.
			 */
			callback: (): void => {
				changeFps(targetFps.value);
			}
		});
		targetFps.value = useDisplay().mobile.value ? defaultMobileFps : defaultFps; // Set initial FPS

		// Average real FPS
		let observedFpsList: Array<number> = new Array<number>();
		universeStore.onUpdateUniverse({
			/**
			 * Manages the list of FPS values on change of amount of shards.
			 *
			 * @remarks
			 * When shards increase, fps list increased by current average FPS, defaulting to default FPS.
			 * When shards decrease, last values are used.
			 */
			callback() {
				let desiredFpsListLength: number = universeStore.universe.shards.size * averageFpsAmount;
				let currentFpsListLength: number = observedFpsList.length;

				if (desiredFpsListLength === currentFpsListLength) {
					// Fast termination
				} else if (desiredFpsListLength > currentFpsListLength) {
					// Insert data to be shifted
					observedFpsList = new Array<number>(desiredFpsListLength - currentFpsListLength)
						.fill(averageFps.value)
						.concat(observedFpsList);
				} else {
					observedFpsList = observedFpsList.slice(-desiredFpsListLength);
				}
			}
		});
		// Default interval is 1000 milliseconds
		useIntervalFn(() => {
			universeStore.universe.shards.forEach(shard => {
				observedFpsList.shift();
				observedFpsList.push(shard.app.ticker.FPS);
			});
			// Calculate average FPS
			let sum: number = observedFpsList.reduce((a, b) => a + b);
			let targetFpsUnref: number = targetFps.value;
			let newAverageFps: number = Math.ceil(sum / observedFpsList.length);
			recordStore.records[averageFpsRecordId] = newAverageFps > targetFpsUnref ? targetFpsUnref : newAverageFps;
		});
	}

	return { averageFps, defaultDeviceFps, targetFps };
}

/**
 * Device composable type.
 */
export type UsedGraphics = ReturnType<typeof useGraphics>;
