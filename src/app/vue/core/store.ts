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
		value: any;
	}): void {
		return store.commit("recordMutation", v);
	}

	/**
	 * Gets the record from the store, or default value.
	 *
	 * @param v - Destructured parameter
	 * @returns Void
	 */
	function getBooleanRecord({
		id,
		defaultValue = false
	}: {
		/**
		 * ID.
		 */
		id: string | symbol | undefined;

		/**
		 * Value.
		 */
		defaultValue?: boolean;
	}): boolean {
		return id ? Boolean(records.value[id]) : defaultValue;
	}

	/**
	 * Toggles boolean record, or sets the default value.
	 *
	 * @param param - Destructured parameter
	 * @returns Boolean if toggle was successful, false if set to default
	 */
	function toggleBooleanRecord({
		id,
		defaultValue = true
	}: {
		/**
		 * ID.
		 */
		id: string | symbol | undefined;

		/**
		 * Value.
		 */
		defaultValue?: boolean;
	}): boolean {
		let value: boolean = defaultValue;
		let result: boolean = false;

		if (id) {
			const record: unknown = records.value[id];
			if (typeof record === "boolean") {
				value = !record;
				result = true;
			}

			setRecord({
				id,
				value
			});
		}

		return result;
	}

	return { getBooleanRecord, records, setRecord, toggleBooleanRecord };
}
