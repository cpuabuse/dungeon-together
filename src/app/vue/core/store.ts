/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shared functionality between Switch and Slider elements.
 *
 * @file
 */

import { defineStore } from "pinia";
import { UniverseStore } from "../../client/gui";

/**
 * Records store.
 */
// Infer from store
// eslint-disable-next-line @typescript-eslint/typedef
export const useRecordsStore = defineStore("records", {
	/**
	 * State.
	 *
	 * @returns State
	 */
	state: () => {
		return { records: {} as UniverseStore["state"]["records"] };
	}
});

/**
 * Get the records.
 *
 * @returns Records
 */
// Infer composable return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRecords() {
	// Infer store type
	// eslint-disable-next-line @typescript-eslint/typedef
	const { records } = useRecordsStore();

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
		return id ? Boolean(records[id]) : defaultValue;
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
			const record: unknown = records[id];
			if (typeof record === "boolean") {
				value = !record;
				result = true;
			}

			records[id] = value;
		}

		return result;
	}

	return { getBooleanRecord, records, toggleBooleanRecord };
}
