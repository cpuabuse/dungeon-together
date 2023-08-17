/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shared functionality between Switch and Slider elements.
 *
 * @file
 */

import { computed } from "vue";
import { useStore } from "vuex";
import { UniverseStore } from "../../client/gui";

/**
 * Get the records.
 *
 * @returns Records
 */
// Infer composable return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRecords() {
	const store: UniverseStore = useStore();

	// Infer computed
	// eslint-disable-next-line @typescript-eslint/typedef
	const records = computed((): UniverseStore["state"]["records"] => {
		return store.state.records;
	});

	/**
	 * Sets the record in the store.
	 *
	 * @param v - Destructured parameter
	 * @returns Void
	 */
	function setRecord(v: {
		/**
		 * ID.
		 */
		id: string | symbol;
		/**
		 * Value.
		 */
		value: boolean;
	}): void {
		return store.commit("recordMutation", v);
	}

	return { records, setRecord };
}
