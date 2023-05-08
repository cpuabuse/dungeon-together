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
import { ExtractProps, OverlayContentUiActionParam } from "../types";

/**
 * Size for the tab.
 */
export enum ElementSize {
	/**
	 * Small tab.
	 */
	Small = "sm",

	/**
	 * Medium tab.
	 */
	Medium = "md",

	/**
	 * Large tab.
	 */
	Large = "lg"
}

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
 * Shared options for content type.
 */
type OverlayListItemEntrySharedRecords = {
	/**
	 * Informational list type.
	 */
	type?: OverlayListItemEntryType;
} & ExtractProps<typeof overlayListItemNarrowProps>;

/**
 * Tabs type.
 */
export type OverlayContentTabs = Array<{
	/**
	 * Name to display.
	 */
	name: string;

	/**
	 * Items to display.
	 */
	items: Array<OverlayListItemEntry>;
}>;

/**
 * Helper function for type generation.
 */
type OverlayListItemEntryGenerateTypeRecordRequired<Type extends OverlayListItemEntryType> = {
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
export type OverlayContentItemEntryGenerate<
	Type extends OverlayListItemEntryType,
	Options extends object,
	IsTypeOptional extends boolean = false,
	HasData extends boolean = true
> = (HasData extends true
	? {
			/**
			 * Data value.
			 */
			data?: string | number;
	  }
	: unknown) &
	Options &
	OverlayListItemEntryGenerateTypeRecord<Type>;

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
						 * Badge value, if any.
						 */
						badge?: string | number;

						/**
						 * Data to display.
						 */
						data: string | number;

						/**
						 * Optional UI actions.
						 */
						uiActions?: Array<OverlayContentUiActionParam>;
					},
					true
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
						tabs: OverlayContentTabs;

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
					},
					false,
					false
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

/**
 * Content type used in overlay content.
 */
export enum OverlayType {
	Block = "block",
	BlockCompact = "block-compact",
	Menu = "menu",
	MenuCompact = "menu-compact"
}

/**
 * Base props for all components of overlay content family.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListSharedProps = {
	contentType: {
		default: OverlayType.Block,
		type: String as PropType<OverlayType>
	}
} as const;

/**
 * Base props for overlay list item, body and descendants.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListChildSharedProps = {
	/** Do not fill by default. */
	isHiddenCaretDisplayedIfMissing: { default: false, type: Boolean },

	/** Do not fill by default. */
	isHiddenIconDisplayedIfMissing: { default: false, type: Boolean },

	/** Default to single element. */
	isLast: { default: true, type: Boolean }
};

/**
 * Prop types for overlay list family.
 */
export type OverlayListSharedProps = ExtractPropTypes<typeof overlayListSharedProps>;

/**
 * Methods for overlay components.
 *
 * @param param - Destructured parameter
 * @returns Methods for overlay components
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOverlayListShared({
	props
}: {
	/**
	 * Props used.
	 */
	props: OverlayListSharedProps;
}) {
	const isMenu: ComputedRef<boolean> = computed((): boolean => {
		return [OverlayType.Menu, OverlayType.MenuCompact].includes(props.contentType);
	});

	// Infer type
	const isCompact: ComputedRef<boolean> = computed((): boolean => {
		return [OverlayType.BlockCompact, OverlayType.MenuCompact].includes(props.contentType);
	});

	const isCardWrapped: ComputedRef<boolean> = computed((): boolean => {
		return isMenu.value;
	});

	// Infer complex type
	// eslint-disable-next-line @typescript-eslint/typedef
	const staticProps = computed(() => {
		return { contentType: props.contentType };
	});

	return {
		isCardWrapped,
		isCompact,
		isMenu,
		staticProps
	};
}
