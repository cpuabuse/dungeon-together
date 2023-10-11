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

/**
 * Names for actions in `useUpdateActionsStore`.
 */
// Infer const type
// eslint-disable-next-line @typescript-eslint/typedef
export const updateActionNames = [
	// Dispatched when story notifiaction array is updated.
	"updateStoryNotification"
] as const;

/**
 * Union of action names in `useUpdateActionsStore`.
 */
export type UpdateActionNames = (typeof updateActionNames)[number];

/**
 * Provides object of stores to be generated/injected per app.
 *
 * @returns Object of stores
 */
// Infer composable types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function composableStoreFactory() {
	return {
		useUpdateActionsStore: defineStore("updateActions", {
			actions: updateActionNames.reduce((result, actionName) => {
				return {
					...result,

					/**
					 * Dispatched action.
					 */
					[actionName](): void {
						// Do nothing
					}
				};
			}, {} as Record<UpdateActionNames, () => void>)
		})
	};
}

/**
 * Type of stores object for injection.
 */
export type Stores = ReturnType<typeof composableStoreFactory>;
