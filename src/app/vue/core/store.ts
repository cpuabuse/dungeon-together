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
import { WritableComputedRef, computed, inject } from "vue";
import { UniverseStore } from "../../client/gui";
import { toCapitalized } from "../../common/text";
import { MaybePartial } from "../../common/utility-types";

/**
 * Names for actions in `useUpdateActionsStore`.
 */
// Infer const type
// eslint-disable-next-line @typescript-eslint/typedef
export const updateActionNames = [
	// Dispatched when story notification array is updated.
	"updateStoryNotification",
	"updateGridLevel"
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
		// Records store
		useRecordStore: defineStore("new-records", {
			actions: {
				/**
				 * Generates computed property for record.
				 *
				 * @see `getRecord()` for default value and validator
				 * @param param - Desctructured parameter
				 * @returns Computed property
				 */
				computedRecord<Type = boolean>({
					id,
					defaultValue = false as Type,
					validator = (value: unknown): value is Type => {
						return typeof value === "boolean";
					}
				}: {
					/**
					 * Record ID.
					 */
					id: string | symbol | undefined;
				} & MaybePartial<
					Type extends boolean ? false : true,
					{
						/**
						 * Validator.
						 */
						validator: (value: unknown) => value is Type;

						/**
						 * Value.
						 */
						defaultValue: Type;
					}
				>): WritableComputedRef<Type> {
					return computed({
						/**
						 * Getter.
						 *
						 * @returns Record value or default
						 */
						get: (): Type => {
							return this.getRecord<Type>({ defaultValue, id, validator });
						},

						/**
						 * Setter.
						 *
						 * @param param - Record value to set
						 */
						set: (param: Type): void => {
							if (id) {
								this.records[id] = param;
							}
						}
					});
				},

				/**
				 * Gets the record from the store, or default value.
				 *
				 * @remarks
				 * Defaults for validator and default value are set for boolean type parameter. If different type parameter is set, they would be required, hence type casting to adhere to generic within default parameters.
				 *
				 * @param param - Destructured parameter
				 * @returns Void
				 */
				getRecord<Type = boolean>({
					id,
					defaultValue = false as Type,
					validator = (value: unknown): value is Type => {
						return typeof value === "boolean";
					}
				}: {
					/**
					 * ID.
					 */
					id: string | symbol | undefined;

					/**
					 * Value.
					 */
					defaultValue?: Type;
				} & MaybePartial<
					Type extends boolean ? false : true,
					{
						/**
						 * Validator.
						 */
						validator: (value: unknown) => value is Type;

						/**
						 * Value.
						 */
						defaultValue: Type;
					}
				>): Type {
					if (id) {
						const record: unknown = this.records[id];
						if (validator(record)) {
							return record;
						}
					}
					return defaultValue;
				},

				/**
				 * Toggles boolean record, or sets the default value.
				 *
				 * @remarks
				 * Would overwrite.
				 * Calls `getRecord()`. If default value is true, `getRecord()` is called with default value of false. Then if `getRecord()` fails and returns default value, or if it correctly returns false, the record is set to true, which is required behavior for both paths.
				 *
				 * @param param - Destructured parameter
				 */
				toggleBooleanRecord({
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
				}): void {
					if (id) {
						const record: boolean = this.getRecord({ defaultValue: !defaultValue, id });
						this.records[id] = !record;
					}
				}
			},

			/**
			 * State.
			 *
			 * @returns State
			 */
			state: () => {
				return { records: {} as UniverseStore["state"]["records"] };
			}
		}),

		// Update actions store
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
