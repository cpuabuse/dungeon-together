/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Types for vue.
 */

import { ExtractDefaultPropTypes, ExtractPropTypes, PropType } from "vue";
import { OverlayWindowItemType as ItemType } from "../../common/front";
import { OverlayContentUiActionParam } from "./overlay-container";

export * from "./overlay-container";

/**
 * Extracts props from prop object, making ones that has default, optional.
 */
export type ExtractProps<O> = Partial<ExtractDefaultPropTypes<O>> &
	Omit<ExtractPropTypes<O>, keyof ExtractDefaultPropTypes<O>>;

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
	items: Array<OverlayContentItem>;
}>;

/**
 * Shared options for content type.
 */
type OverlayContentTypeSharedOptions = {
	/**
	 * Informational list type.
	 */
	type?: ItemType;

	/**
	 * Name to display.
	 */
	name?: string;

	/**
	 * Optional icon.
	 */
	icon?: string;

	/**
	 * Description.
	 */
	description?: string;
};

/**
 * Helper function for type generation.
 */
type OverlayContentItemGenerateType<Type extends ItemType> = {
	/**
	 * Type of the item.
	 */
	type: Type;
};

/**
 * Type for item to generate.
 */
type OverlayContentItemGenerate<
	Type extends ItemType,
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
	(IsTypeOptional extends true ? Partial<OverlayContentItemGenerateType<Type>> : OverlayContentItemGenerateType<Type>);
/**
 * Type for item props.
 */
export type OverlayContentItem =
	// Informational object, default
	OverlayContentTypeSharedOptions &
		(
			| OverlayContentItemGenerate<
					ItemType.InfoElement,
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
			| OverlayContentItemGenerate<
					ItemType.Uuid,
					{
						/**
						 * UUID value.
						 */
						uuid: string;
					}
			  >
			| OverlayContentItemGenerate<
					ItemType.Tab,
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
			| OverlayContentItemGenerate<
					ItemType.Switch,
					{
						/**
						 * Event ID.
						 */
						id: string;
					},
					false,
					false
			  >
			| OverlayContentItemGenerate<
					ItemType.Slot,
					{
						/**
						 * Slot name.
						 */
						id: string;
					}
			  >
		);

/**
 * Overlay list prop.
 */
export type OverlayListProp = {
	/**
	 * Name of the list.
	 */
	name: string;

	/**
	 * Items to display.
	 */
	items: Array<OverlayContentItem>;
};

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
 * Compact toolbar menu item(button).
 */
export type CompactToolbarMenuItem = {
	/**
	 * Name of the item.
	 *
	 * @remarks
	 * Keep it short, so it fits.
	 */
	name: string;

	/**
	 * Icon.
	 */
	icon?: string;
} & (
	| {
			/**
			 * Item mode discriminator.
			 *
			 * @remarks
			 * `undefined` refers to display only.
			 */
			mode?: undefined;
	  }
	| {
			/**
			 * Item mode for click.
			 */
			mode?: "click";
	  }
);

/**
 * Base props for compact toolbar menu.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const compactToolbarMenuBaseProps = {
	/**
	 * Menu icon.
	 */
	icon: {
		default: "fa-carrot",
		type: String
	},

	/**
	 * Menu items.
	 */
	items: { required: true, type: Array as PropType<Array<CompactToolbarMenuItem>> },

	/**
	 * Maximum pinned amount of items, when collapsed.
	 */
	maxPinnedAmount: { default: 1, type: Number },

	/**
	 * Menu name.
	 */
	name: { required: true, type: String },

	/**
	 * Name subtext.
	 */
	nameSubtext: { required: false, type: String }
} as const;

/**
 * Props that are in menu and toolbar, effectively aggregated, unlike `icon`, which has it's own value on different levels.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const compactToolbarSharedMenuProps = {
	hasLabels: {
		default: true,
		type: Boolean
	},

	/**
	 * Highlight menu toggle when open.
	 */
	isHighlightedOnOpen: { default: true, type: Boolean }
} as const;

/**
 * Base prop type for toolbar menu.
 */
export type CompactToolbarMenuBaseProps = ExtractProps<typeof compactToolbarMenuBaseProps>;

/**
 * Compact toolbar menu.
 */
export type CompactToolbarMenu = {
	[K1 in keyof CompactToolbarMenuBaseProps]: K1 extends "items"
		? CompactToolbarMenuBaseProps[K1] extends Array<infer R>
			? Array<
					Omit<R, "mode"> & {
						/**
						 * Click callback.
						 */
						onClick?: () => void;
					}
			  >
			: never
		: CompactToolbarMenuBaseProps[K1];
};

/**
 * Helper type for using compact toolbar.
 */
export type CompactToolbarData = {
	/**
	 * Menus.
	 */
	menus: Array<CompactToolbarMenu>;
};

/**
 * Converts compact toolbar data to menus to use as props.
 *
 * @param param - Toolbar data
 * @returns Menus
 */
export function compactToolbarDataToMenuBaseProps({ menus }: CompactToolbarData): Array<CompactToolbarMenuBaseProps> {
	return menus.map(menu => {
		const { items, ...rest }: typeof menu = menu;
		return {
			items: items.map(item => {
				return { icon: item.icon, name: item.name, ...(item.onClick ? { mode: "click" } : {}) };
			}),
			...rest
		};
	});
}
