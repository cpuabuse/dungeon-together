/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Types for vue.
 */

import { ExtractDefaultPropTypes, ExtractPropTypes, PropType } from "vue";

/**
 * Extracts props from prop object, making ones that has default, optional.
 */
export type ExtractProps<O> = Partial<ExtractDefaultPropTypes<O>> &
	Omit<ExtractPropTypes<O>, keyof ExtractDefaultPropTypes<O>>;

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
	name: { required: true, type: String }
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
 * Helper type for using compact toolbar.
 */
export type CompactToolbarData = {
	/**
	 * Menus.
	 */
	menus: Array<{
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
	}>;
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
