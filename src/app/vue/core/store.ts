/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Pinia stores.
 */

import { StoreDefinition, defineStore } from "pinia";
import { ComputedRef, MaybeRef, ShallowRef, WritableComputedRef, computed, inject, shallowRef, unref } from "vue";
import { ClientUniverseStateRcMenuData } from "../../client/gui";
import { ClientUniverse } from "../../client/universe";
import { toCapitalized } from "../../common/text";
import { MaybePartial } from "../../common/utility-types";
import { LogLevel } from "../../core/error";

/**
 * Words to refer to stores.
 */
export enum StoreWord {
	/**
	 * Record store.
	 */
	Record = "record",

	/**
	 * Universe store.
	 */
	Universe = "universe",

	/**
	 * Input store.
	 */
	Input = "input",

	/**
	 * GUI store.
	 */
	Gui = "gui"
}

/**
 * Helper type for use name generation.
 */
type UseStoreWordStore<Word extends StoreWord> = `use${Capitalize<Word>}Store`;

/**
 * Names for actions in `useUniverseStore.actions`.
 */
// Infer const type
// eslint-disable-next-line @typescript-eslint/typedef
export const updateActionNames = (
	[
		// Dispatched when story notification array is updated.
		"storyNotification",
		"gridLevel",
		"statusNotification",
		"playerDictionary",
		"universe",
		"entityDictionary"
	] as const
).map(actionName => {
	return `update${toCapitalized({ text: actionName })}` as const;
});

/**
 * Union of action names in `useUniverseStore.actions`.
 */
export type UpdateActionNames = (typeof updateActionNames)[number];

/**
 * Arbitrary base for "z-index" of overlay.
 */
const baseZIndex: number = 1000;

/**
 * Type for handle passed for "z-index".
 */
type OverlayRegistryHandle = ShallowRef<number>;

/**
 * Type for overlay registration return.
 */
export type GuiStoreOverlayRecord = {
	/**
	 * Handle to know which overlay to move.
	 */
	handle: OverlayRegistryHandle;

	/**
	 * Z-index calculated from handle and base, in string form for ease of use.
	 */
	zIndex: ComputedRef<string>;
};

/**
 * Provides object of stores to be generated/injected per app.
 *
 * @param param - Destructured parameter
 * @returns Object of stores
 */
// Infer composable types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function composableStoreFactory({
	universe
}: {
	/**
	 * Universe.
	 */
	universe: ClientUniverse;
}) {
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
	 * Store instance for update action store, used as `this`.
	 */
	type UpdateActionStoreInstance = ReturnType<UpdateActionStoreDefine>;

	/**
	 * Helper function that generates names for use store functions.
	 *
	 * @param key - Store name
	 * @returns Name of the store use function
	 */
	function k<Word extends StoreWord>(key: Word): UseStoreWordStore<Word> {
		return `use${toCapitalized({ text: key })}Store`;
	}

	return {
		// Records store
		[k(StoreWord.Record)]: defineStore(StoreWord.Record, {
			actions: {
				/**
				 * Generates computed property for record.
				 *
				 * @see `getRecord()` for default value and validator
				 * @param param - Destructured parameter
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
						defaultValue: MaybeRef<Type>;
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
					defaultValue?: MaybeRef<Type>;
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
						defaultValue: MaybeRef<Type>;
					}
				>): Type {
					if (id) {
						const record: unknown = this.records[id];
						if (validator(record)) {
							return record;
						}
					}
					return unref(defaultValue);
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
				return { records: {} as Record<string | symbol, any> };
			}
		}),

		// Universe store
		[k(StoreWord.Universe)]: defineStore(StoreWord.Universe, {
			// Update action store
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
			}, {} as UpdateActionStorePrimaryCallbackAndListenerRecord),

			/**
			 * State.
			 *
			 * @returns State
			 */
			state: () => {
				return { universe: shallowRef(universe) };
			}
		}),

		// Input store
		[k(StoreWord.Input)]: defineStore(StoreWord.Input, {
			/**
			 * State.
			 *
			 * @returns State
			 */
			state: () => {
				return {
					/**
					 * Whether input is focused.
					 */
					rcMenuData: shallowRef(null as ClientUniverseStateRcMenuData)
				};
			}
		}),

		// GUI store
		[k(StoreWord.Gui)]: defineStore(StoreWord.Gui, () => {
			// Overlay "z-index" registry
			let overlayRegistry: Array<OverlayRegistryHandle> = new Array<OverlayRegistryHandle>();

			/**
			 * Registers overlay for "z-index".
			 *
			 * @remarks
			 * Could be extended to support multiple registries at the same time, but that would be done when required.
			 *
			 * @returns Handle and "z-index" tied together
			 */
			function registerOverlay(): GuiStoreOverlayRecord {
				const handle: OverlayRegistryHandle = shallowRef(overlayRegistry.length);
				overlayRegistry.push(handle);

				return {
					handle,
					zIndex: computed(() => {
						return (baseZIndex + handle.value).toString();
					})
				};
			}

			/**
			 * Recalculates "z-indices".
			 */
			function recalc(): void {
				overlayRegistry.forEach((fixHandle, fixIndex) => {
					fixHandle.value = fixIndex;
				});
			}

			/**
			 * Moves overlay up ("z-index").
			 *
			 * @param param - Destructured parameter
			 */
			function upOverlay({ handle }: Record<"handle", OverlayRegistryHandle>): void {
				let idx: number = handle.value;

				// Only act if not already last
				if (idx < overlayRegistry.length) {
					if (handle === overlayRegistry[idx]) {
						const beginning: Array<OverlayRegistryHandle> = overlayRegistry.slice(0, idx);
						const rest: Array<OverlayRegistryHandle> = overlayRegistry.slice(idx + 1);

						// Rearrange registry
						overlayRegistry = [...beginning, ...rest, handle];
					} else {
						universe.log({
							error: new Error(
								`Overlay registry handle is invalid for handle with index ${idx}, will attempt to correct`
							),
							level: LogLevel.Error
						});

						// Fix code, should not really be invoked, but can happen if something is wrong with queueing, if that happens, code must be restructured
						overlayRegistry = Array.from(new Set(overlayRegistry));
					}
					recalc();
				}
			}

			const universeUiElementRecordId: symbol = Symbol("universeUiElementRecordId");

			return { registerOverlay, universeUiElementRecordId, upOverlay };
		})
	} satisfies {
		[Word in StoreWord as UseStoreWordStore<Word>]: unknown;
	};
}

/**
 * Type of stores object for injection.
 */
export type Stores = ReturnType<typeof composableStoreFactory>;

/**
 * Extract store type.
 */
export type Store<Word extends StoreWord> = ReturnType<Stores[UseStoreWordStore<Word>]>;

/**
 * Per app stores object.
 *
 * @returns Object with un-instantiated stores
 */
export function useStores(): Stores {
	return inject("stores");
}
