/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Overlay related composables.
 *
 * @file
 */

import { ComputedRef, ExtractPropTypes, PropType, computed } from "vue";
import { Uuid } from "../../common/uuid";
import { ActionWords } from "../../server/action";
import { ElementSize } from "../common/element";
import { ExtractProps, ExtractPropsFromComponentClass, SetupContextEmit } from "../common/utility-types";
import type OverlayListItemAssembler from "../components/overlay-list-item-assembler.vue";

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
	List
}

/**
 * Shared options for content type.
 */
type OverlayListItemEntrySharedRecords = {
	/**
	 * Informational list type.
	 */
	type?: OverlayListItemEntryType;

	/**
	 * Data value.
	 */
	data?: string | number;
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
						id: string;
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
	EntityDebugInfo = "entityDebugInfo"
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
export type OverlayListChildSharedProps = ExtractPropTypes<typeof overlayListChildSharedProps>;

/**
 * Prop types for overlay list family.
 */
export type OverlayListSharedProps = ExtractPropTypes<typeof overlayListSharedProps>;

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
	description: {
		required: false,
		type: String
	},

	icon: {
		required: false,
		type: String
	},

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
	props: OverlayListSharedProps;

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
			icon: props.icon,
			isHiddenCaretDisplayedIfMissing: props.isHiddenCaretDisplayedIfMissing,
			isHiddenIconDisplayedIfMissing: props.isHiddenIconDisplayedIfMissing,
			name: props.name
		};
	});

	return { assemblerProps };
}
// #endregion Composables
