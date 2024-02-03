/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Device composables.
 */

import { WritableComputedRef } from "vue";
import { useDisplay } from "vuetify";
import { Store, StoreWord } from "./store";

/**
 * Device composable.
 *
 * @param param - Destructured parameters
 * @returns Device composable
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDevice({
	recordStore
}: {
	/**
	 * Record store.
	 */
	recordStore: Store<StoreWord.Record>;
}) {
	const isMobileRecordId: symbol = Symbol("is-mobile");

	const isMobile: WritableComputedRef<boolean> = recordStore.computedRecord({
		defaultValue: useDisplay().mobile,
		id: isMobileRecordId
	});

	return { isMobile, isMobileRecordId };
}

/**
 * Device composable type.
 */
export type UsedDevice = ReturnType<typeof useDevice>;
