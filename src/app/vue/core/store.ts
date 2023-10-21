/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Shared functionality between Switch and Slider elements.
 *
 * @file
 */

import { StoreDefinition, defineStore } from "pinia";
import { inject } from "vue";
import { UniverseStore } from "../../client/gui";
import { toCapitalized } from "../../common/text";

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
	"updateStoryNotification",
	"knockKnock"
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
	/**
	 * Helper type for subscribe object.
	 */
	type UpdateActionStoreOnTypeParam = {
		/**
		 * Callback on subscription.
		 */
		callback: () => void;

		/**
		 * Whether to call callback immediately.
		 */
		isImmediate?: boolean;
	};

	/**
	 * Primary actions and listeners for update action store.
	 *
	 * @remarks
	 * When cast to this in `reduce()`, cannot verify type for dynamic keys, so have to be careful that the object is exhaustive. Also, note the use of `UpdateActionStoreInstance` for `this`.
	 */
	type UpdateActionStorePrimaryCallbackAndListenerRecord = Record<UpdateActionNames, () => void> &
		Record<`on${Capitalize<UpdateActionNames>}`, (param: UpdateActionStoreOnTypeParam) => void>;

	/**
	 * Store definition for update action store.
	 */
	type UpdateActionStoreDefine = StoreDefinition<
		"updateActions",
		// Following native Pinia type
		/* eslint-disable @typescript-eslint/ban-types */
		{},
		{},
		/* eslint-enable @typescript-eslint/ban-types */
		UpdateActionStorePrimaryCallbackAndListenerRecord
	>;

	/**
	 * Store instace for update action store, used as `this`.
	 */
	type UpdateActionStoreInstance = ReturnType<UpdateActionStoreDefine>;

	return {
		useUpdateActionStore: defineStore("updateActions", {
			actions: updateActionNames.reduce((result, actionName) => {
				// Cannot verify type for dynamic keys, so have to be careful that this is exhaustive
				return {
					...result,

					/**
					 * Dispatched action.
					 *
					 * @see `UpdateActionStorePrimaryCallbackAndListenerRecord`
					 */
					[actionName](): void {
						// Do nothing
					},

					/**
					 * Subscribe to update action.
					 *
					 * @remarks
					 * Component will unsubscribe from actions automatically on unmount - {@link https://pinia.vuejs.org/core-concepts/actions.html#Subscribing-to-actions}.
					 *
					 * @see `UpdateActionStorePrimaryCallbackAndListenerRecord`
					 * @param param - Destructured parameter
					 */
					[`on${toCapitalized({ text: actionName })}`](
						this: UpdateActionStoreInstance,
						{ callback, isImmediate = true }: UpdateActionStoreOnTypeParam
					): void {
						if (isImmediate) {
							callback();
						}

						// ESLint doesn't infer
						// eslint-disable-next-line @typescript-eslint/typedef
						this.$onAction(({ name }) => {
							if (name === actionName) {
								callback();
							}
						});
					}
				};
			}, {} as UpdateActionStorePrimaryCallbackAndListenerRecord)
		})
	};
}

/**
 * Type of stores object for injection.
 */
export type Stores = ReturnType<typeof composableStoreFactory>;

/**
 * Per app stores object.
 *
 * @returns Object with uninstantiated stores
 */
export function useStores(): Stores {
	return inject("stores");
}
