/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Types for vue.
 */

import { ExtractDefaultPropTypes, ExtractPropTypes, PropType } from "vue";
import { OverlayContainerItemType as ItemType } from "../../common/front";

export * from "./overlay-container";

/**
 * Extracts props from prop object, making ones that has default, optional.
 */
export type ExtractProps<O> = Partial<ExtractDefaultPropTypes<O>> &
	Omit<ExtractPropTypes<O>, keyof ExtractDefaultPropTypes<O>>;

/**
 * Tabs type.
 */
export type OverlayContainerContentTabs = Array<{
	/**
	 * Name to display.
	 */
	name: string;

	/**
	 * Items to display.
	 */
	items: Array<OverlayContainerContentItem>;
}>;

/**
 * Type for item props.
 */
export type OverlayContainerContentItem =
	// Informational object, default
	| {
			/**
			 * Informational list type.
			 */
			type?: ItemType.InfoElement;

			/**
			 * Badge value, if any.
			 */
			badge?: string | number;

			/**
			 * Name to display.
			 */
			name: string;

			/**
			 * Data to display.
			 */
			data: string | number;
	  }
	| {
			/**
			 * UUID type.
			 */
			type: ItemType.Uuid;

			/**
			 * UUID value.
			 */
			uuid: string;

			/**
			 * Name to display.
			 */
			name: string;
	  }
	| {
			/**
			 * Tab type.
			 */
			type: ItemType.Tab;

			/**
			 * Data to display.
			 */
			tabs: OverlayContainerContentTabs;

			/**
			 * Size of the tab.
			 */
			size?: ElementSize;
	  }
	| {
			/**
			 * Switch type.
			 */
			type: ItemType.Switch;

			/**
			 * Switch name.
			 */
			name: string;

			/**
			 * Event ID.
			 */
			id: string;
	  }
	| {
			/**
			 * Slot type.
			 */
			type: ItemType.Slot;

			/**
			 * Slot name.
			 */
			id: string;

			/**
			 * Slot name to display.
			 */
			name: string;
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
