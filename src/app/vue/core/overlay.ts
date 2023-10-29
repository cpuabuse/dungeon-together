/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Overlay related composables.
 *
 * @file
 */

import { ComputedRef, ExtractPropTypes, PropType, Ref, computed, onUnmounted, ref, unref, watch } from "vue";
import { ClientPlayer } from "../../client/connection";
import { Uuid } from "../../common/uuid";
import { ActionWords } from "../../server/action";
import { ElementSize } from "../common/element";
import { ExtractProps, ExtractPropsFromComponentClass, MaybeRef, SetupContextEmit } from "../common/utility-types";
import type OverlayListItemAssembler from "../components/overlay-list-item-assembler.vue";
import { CompactToolbarMenuItem } from "./compact-toolbar";
import { IconProps, iconProps } from "./icon";
import { Stores } from "./store";

// #region Items
/**
 * Possible item types.
 */
export enum OverlayListItemEntryType {
	/**
	 * Informational element.
	 */
	InfoElement,

	/**
	 * Type for UUID representation.
	 */
	// False negative
	// eslint-disable-next-line @typescript-eslint/no-shadow
	Uuid,

	/**
	 * Type for tab.
	 */
	Tab,

	/**
	 * Type for switch element.
	 */
	Switch,

	/**
	 * Type for slot.
	 */
	Slot,

	/**
	 * Type for list.
	 */
	List,

	/**
	 * Single selection.
	 */
	Select
}

/**
 * Shared options for content type.
 */
type OverlayListItemEntrySharedRecords = {
	/**
	 * Informational list type.
	 */
	type?: OverlayListItemEntryType;
} & OverlayListItemNarrowProps;

/**
 * Helper function for type generation.
 */
type OverlayListItemEntryGenerateTypeRecordRequired<Type extends OverlayListItemEntryType = OverlayListItemEntryType> =
	{
		/**
		 * Type of the item.
		 */
		type: Type;
	};

/**
 * Helper function for type generation.
 */
type OverlayListItemEntryGenerateTypeRecord<Type extends OverlayListItemEntryType> =
	Type extends OverlayListItemEntryType.InfoElement
		? Partial<OverlayListItemEntryGenerateTypeRecordRequired<Type>>
		: OverlayListItemEntryGenerateTypeRecordRequired<Type>;

/**
 * Type for item to generate.
 */
export type OverlayContentItemEntryGenerate<Type extends OverlayListItemEntryType, Options extends object> = Options &
	OverlayListItemEntryGenerateTypeRecord<Type>;

/**
 * Items property.
 */
export type OverlayListItems = Array<OverlayListItemEntry>;

/**
 * Object with items property.
 */
type OverlayListItemsObject = {
	/**
	 * Items.
	 */
	items: OverlayListItems;
};

/**
 * Tabs type.
 */
export type OverlayListTabs = Array<OverlayListItemEntrySharedRecords & OverlayListItemsObject>;

/**
 * Type for item props.
 */
export type OverlayListItemEntry =
	// Informational object, default
	OverlayListItemEntrySharedRecords &
		(
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.InfoElement,
					{
						/**
						 * Optional UI actions.
						 */
						uiActions?: Array<OverlayContentUiActionParam>;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.Uuid,
					{
						/**
						 * UUID value.
						 */
						uuid: string;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.Tab,
					{
						/**
						 * Data to display.
						 */
						tabs: OverlayListTabs;

						/**
						 * Size of the tab.
						 */
						size?: ElementSize;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.Switch,
					{
						/**
						 * Event ID.
						 */
						id: string | symbol;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.Slot,
					{
						/**
						 * Slot name.
						 */
						id: string;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.List,
					{
						/**
						 * Items.
						 */
						items: Array<OverlayListItemEntry>;
					}
			  >
			| OverlayContentItemEntryGenerate<
					OverlayListItemEntryType.Select,
					{
						/**
						 * Event ID.
						 */
						items: Array<{
							/**
							 * Display name.
							 */
							name: string;

							/**
							 * Storage value.
							 *
							 * @remarks
							 * Vuetify does not seem to support symbols for `VSelect`.
							 */
							value: string;
						}>;

						/**
						 * Record ID.
						 */
						id: string | symbol;
					}
			  >
		);

/**
 * Extract entry from a type.
 */
export type OverlayListItemEntryExtract<Type extends OverlayListItemEntryType> = OverlayListItemEntry &
	OverlayListItemEntryGenerateTypeRecord<Type>;
// #endregion Items

// #region UI Actions
/**
 * Words used for UI action.
 */
export enum OverlayContainerUiActionWords {
	EntityAction = "entityAction",
	EntityInfo = "entityInfo",
	EntityDebugInfo = "entityDebugInfo",
	CellDebugInfo = "cellDebugInfo",
	ForceMovement = "movement"
}

/**
 * Helper type for UI action, guarantees exhaustiveness, and constraints.
 */
type OverlayContentUiActionHelper<
	T extends {
		/**
		 * UI action.
		 */
		uiActionWord: OverlayContainerUiActionWords;
	}
> = OverlayContainerUiActionWords extends T["uiActionWord"] ? T : never;

/**
 * Possible word/parameters combination for UI action.
 */
export type OverlayContentUiActionParam = OverlayContentUiActionHelper<
	IconProps &
		(
			| {
					/**
					 * UI action.
					 */
					uiActionWord: OverlayContainerUiActionWords.EntityAction;

					/**
					 * Action type.
					 */
					entityActionWord: ActionWords;

					/**
					 * Target entity UUID.
					 */
					targetEntityUuid: Uuid;

					/**
					 * Player.
					 */
					player: ClientPlayer;

					/**
					 * UUID.
					 */
					unitUuid: Uuid;
			  }
			| {
					/**
					 * Entity info.
					 */
					uiActionWord: OverlayContainerUiActionWords.EntityInfo;

					/**
					 * Information to display.
					 */
					targetEntityUuid: Uuid;
			  }
			| {
					/**
					 * Entity debug info.
					 */
					uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo;

					/**
					 * Information to display.
					 */
					targetEntityUuid: Uuid;
			  }
			| {
					/**
					 * Cell debug info.
					 */
					uiActionWord: OverlayContainerUiActionWords.CellDebugInfo;

					/**
					 * Information to display.
					 */
					targetCellUuid: Uuid;
			  }
			| {
					/**
					 * UI action.
					 */
					uiActionWord: OverlayContainerUiActionWords.ForceMovement;

					/**
					 * Player.
					 */
					player: ClientPlayer;

					/**
					 * Movement direction.
					 */
					targetCellUuid: Uuid;

					/**
					 * Unit UUID to move.
					 */
					unitUuid: Uuid;
			  }
		)
>;
// #endregion UI Actions

// #region Props
/**
 * Props for discriminated items.
 */
export type OverlayListItemNarrowProps = ExtractProps<typeof overlayListItemNarrowProps>;

/**
 * Prop types for overlay list item, body and descendants.
 */
export type OverlayListChildSharedProps = ExtractProps<typeof overlayListChildSharedProps>;

/**
 * Prop types for overlay list family.
 */
export type OverlayListSharedProps = ExtractProps<typeof overlayListSharedProps>;

/**
 * Prop types for overlay list family.
 *
 * @remarks
 * With `this` scope.
 */
export type OverlayListSharedPropsReceived = ExtractPropTypes<typeof overlayListSharedProps>;

/**
 * Type for emits.
 */
export type OverlayListSharedEmitsUnion = (typeof overlayListSharedEmits)[any];

/**
 * Content type used in overlay content.
 */
export enum OverlayListType {
	Block = "block",
	BlockCompact = "block-compact",
	Menu = "menu",
	MenuCompact = "menu-compact"
}

/**
 * Props for discriminated items.
 */
// Inferring type for props
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListItemNarrowProps = {
	data: {
		required: false,
		type: String
	},

	description: {
		required: false,
		type: String
	},

	...iconProps,

	name: {
		required: false,
		type: String
	}
} as const;

/**
 * Emits for overlay list.
 */
export const overlayListSharedEmits: ["uiAction"] = ["uiAction"];

/**
 * Base props for all components of overlay content family.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListSharedProps = {
	contentType: {
		default: OverlayListType.Block,
		type: String as PropType<OverlayListType>
	}
} as const;

/**
 * Base props for overlay list item, body and descendants.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListChildSharedProps = {
	/* Do not fill by default. */
	isHiddenCaretDisplayedIfMissing: { default: false, type: Boolean },

	/* Do not fill by default. */
	isHiddenIconDisplayedIfMissing: { default: false, type: Boolean },

	/* Default to single element. */
	isLast: { default: true, type: Boolean }
};
// #endregion Props

// #region Composables
/**
 * Methods for overlay components.
 *
 * @param param - Destructured parameter
 * @returns Methods for overlay components
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayListShared({
	props,
	emit
}: {
	/**
	 * Props used.
	 */
	props: OverlayListSharedPropsReceived;

	/**
	 * Context.
	 */
	emit: SetupContextEmit<OverlayListSharedEmitsUnion>;
}) {
	const isMenu: ComputedRef<boolean> = computed((): boolean => {
		return [OverlayListType.Menu, OverlayListType.MenuCompact].includes(props.contentType);
	});

	// Infer type
	const isCompact: ComputedRef<boolean> = computed((): boolean => {
		return [OverlayListType.BlockCompact, OverlayListType.MenuCompact].includes(props.contentType);
	});

	const isCardWrapped: ComputedRef<boolean> = computed((): boolean => {
		return isMenu.value;
	});

	// Infer complex type
	// eslint-disable-next-line @typescript-eslint/typedef
	const staticProps = computed(() => {
		return { contentType: props.contentType };
	});

	/**
	 * Emits UI action to parent component.
	 *
	 * @param uiAction - UI action to emit
	 */
	function emitUiAction(uiAction: OverlayContentUiActionParam): void {
		emit("uiAction", uiAction);
	}

	return {
		emitUiAction,
		isCardWrapped,
		isCompact,
		isMenu,
		staticProps
	};
}

/**
 * Methods for overlay list item variations.
 *
 * @param param - Props
 * @returns Methods for overlay list item variations
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayListItemShared({
	props
}: {
	/**
	 * Component props.
	 *
	 * @remarks
	 * Reactive.
	 */
	props: OverlayListChildSharedProps & OverlayListSharedProps & OverlayListItemNarrowProps;
}) {
	// Infer type
	// eslint-disable-next-line @typescript-eslint/typedef
	const assemblerProps = computed((): ExtractPropsFromComponentClass<typeof OverlayListItemAssembler> => {
		return {
			contentType: props.contentType,
			data: props.data,
			icon: props.icon,
			isHiddenCaretDisplayedIfMissing: props.isHiddenCaretDisplayedIfMissing,
			isHiddenIconDisplayedIfMissing: props.isHiddenIconDisplayedIfMissing,
			modeUuid: props.modeUuid,
			name: props.name
		};
	});

	return { assemblerProps };
}

/**
 * Emits for overlay bus.
 */
export const overlayBusEmits: ["updateMenuItems"] = ["updateMenuItems"];

/**
 * Emits list for overlay bus.
 */
export type OverlayBusEmitsUnion = (typeof overlayBusEmits)[any];

/**
 * Validator for overlay bus emit.
 */
type OverlayBusEmitHelper<T extends SetupContextEmit<OverlayBusEmitsUnion>> = T;

/**
 * Helper for record of menu items registry index.
 * Identifier for the child component, from the perspective of a parent.
 */
type MenuItemsRegistryIndexRecord = Record<"menuItemsRegistryIndex", symbol | string>;

/**
 * Payload for event.
 */
type OverlayBusEmitMenuItemsPayload = MenuItemsRegistryIndexRecord &
	Record<"menuItems", null | Array<CompactToolbarMenuItem>>;

/**
 * Emit type for overlay bus.
 */
export type OverlayBusEmit = OverlayBusEmitHelper<{
	(param: "updateMenuItems", payload: OverlayBusEmitMenuItemsPayload): void;
}>;

/**
 * Type for aggregation of menu items.
 */
export type MenuItemsRegistry = Ref<Map<string | symbol, Array<CompactToolbarMenuItem>>>;

/**
 * For parent/child communication, when using overlay family.
 *
 * @remarks
 * Bus is added to the name, to signify the purpose, and fact this is not required for usage of overlays.
 *
 * @param param - Destructured parameter
 * @returns Display items for constructing overlays
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayBusSource({
	overlayItems,
	recordStore,
	emit,
	menuItemsRegistryIndex,
	usedOverlayBusConsumer
}: MenuItemsRegistryIndexRecord &
	Record<"recordStore", ReturnType<Stores["useRecordStore"]>> & {
		/**
		 * Menu items.
		 *
		 * @remarks
		 * Overlay items is a reference itself, for if menu items are dynamically added or removed by component.
		 * Each menu item is a reference, as it covers individual changes per menu.
		 * List items array is a reference, to track data displayed, and translations down the line. Individual items are not references, as that is not a frequent operation.
		 *
		 * `isDisplayed` is to be used as a model, so it is a normal getter/setter.
		 */
		overlayItems: MaybeRef<
			Array<{
				/**
				 * Menu item.
				 */
				menuItem: MaybeRef<CompactToolbarMenuItem>;

				/**
				 * List items within menu.
				 */
				listItems: MaybeRef<OverlayListItems>;

				/**
				 * Optional overlay name.
				 */
				name?: MaybeRef<string>;
			}>
		>;
	} & (
		| {
				/**
				 * Emit from component context.
				 */
				emit: Pick<OverlayBusEmit, never>;

				/**
				 * Emit or write into registry directly.
				 */
				usedOverlayBusConsumer: ReturnType<typeof useOverlayBusConsumer>;
		  }
		| {
				/**
				 * Emit from component context.
				 */
				emit: OverlayBusEmit;

				/**
				 * Emit or write into registry directly.
				 */
				usedOverlayBusConsumer?: undefined;
		  }
	)) {
	// Whole array is a reference, as elements might be added
	const displayItems: Ref<
		Array<
			Record<"isDisplayed", boolean> &
				Record<"listItems", OverlayListItems> & {
					/**
					 * Optional overlay name.
					 *
					 * @remarks
					 * Would be generated from window information.
					 */
					name?: string;
				}
		>
	> = computed(() =>
		// ESLint doesn't pick up types
		// eslint-disable-next-line @typescript-eslint/typedef
		unref(overlayItems).map(({ menuItem, listItems, name: overlayName }) => {
			const { clickRecordIndex, nameSubtext, name }: CompactToolbarMenuItem = unref(menuItem);
			const isDisplayed: Ref<boolean> = recordStore.computedRecord({ id: clickRecordIndex });

			return {
				/**
				 * Is displayed getter.
				 *
				 * @returns `true` when displayed
				 */
				get isDisplayed(): boolean {
					return isDisplayed.value;
				},

				/**
				 * Is displayed setter.
				 */
				set isDisplayed(value: boolean) {
					isDisplayed.value = value;
				},

				listItems: unref(listItems),
				name: unref(overlayName) ?? (name ? `${name}${nameSubtext ? ` - ${nameSubtext}` : ""}` : nameSubtext)
			};
		})
	);

	// A reference array, rather than array of references, as it's recomputation is rare, and when it does happen, it would probably happen on all items; Moreover it provides convenient target to watch
	const menuItems: Ref<Array<CompactToolbarMenuItem>> = computed(() =>
		// ESLint doesn't pick up types
		// eslint-disable-next-line @typescript-eslint/typedef
		unref(overlayItems).map(({ menuItem }) => unref(menuItem))
	);

	// One way watch for changes in inner refs, and emit to parent
	watch(
		menuItems,
		usedOverlayBusConsumer
			? (newMenuItems): void =>
					usedOverlayBusConsumer.onUpdateMenuItems({ menuItems: newMenuItems, menuItemsRegistryIndex })
			: (newMenuItems): void => emit("updateMenuItems", { menuItems: newMenuItems, menuItemsRegistryIndex }),
		{
			immediate: true
		}
	);

	// Cleanup parent; Conditional event call code not reused, for performance
	onUnmounted(() => {
		// Condition is within unmounted, since peformance impact is minimal
		if (usedOverlayBusConsumer) {
			usedOverlayBusConsumer.onUpdateMenuItems({ menuItems: null, menuItemsRegistryIndex });
		} else {
			emit("updateMenuItems", { menuItems: null, menuItemsRegistryIndex });
		}
	});

	return {
		displayItems
	};
}

/**
 * For use from a parent component, receiving menu events.
 *
 * @returns Composable, `onMenuItems` callback, which needs to added to event of children, if any
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayBusConsumer() {
	// Reactivity with `ref` should trigger on `set()` (shallow would not)
	const menuItemsRegistry: MenuItemsRegistry = ref(new Map<string | symbol, Array<CompactToolbarMenuItem>>());

	/**
	 * Callback for event.
	 *
	 * @param param - Destructured parameter; If `menuItems` is `null`, then it will be removed from registry
	 */
	function onUpdateMenuItems({ menuItemsRegistryIndex, menuItems }: OverlayBusEmitMenuItemsPayload): void {
		if (menuItems) {
			menuItemsRegistry.value.set(menuItemsRegistryIndex, menuItems);
		} else {
			menuItemsRegistry.value.delete(menuItemsRegistryIndex);
		}
	}

	return { menuItemsRegistry, onUpdateMenuItems };
}

/**
 * Pass through the events from children to consumer.
 *
 * @param param - Destructured parameter
 * @returns Composable
 */
// Infer for composable
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayBusIntermediate({
	emit
}: {
	/**
	 * Emit function.
	 */
	emit: OverlayBusEmit;
}) {
	/**
	 * Callback for event that re-emits to parent.
	 *
	 * @param payload - Payload to be emitted
	 */
	function onUpdateMenuItems(payload: OverlayBusEmitMenuItemsPayload): void {
		emit("updateMenuItems", payload);
	}
	return { onUpdateMenuItems };
}
// #endregion Composables
