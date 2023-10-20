/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Utilities for compact toolbar components.
 *
 * @file
 */

import { PropType, Ref, ShallowRef, computed, ref, shallowRef, unref, watch } from "vue";
import { ExtractProps, SetupContextEmit } from "../common/utility-types";
import { type useOverlayBusConsumer } from "./overlay";

/**
 * Menu modes.
 */
export enum CompactToolbarMenuItemMode {
	Click = "click"
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
	 * Name subtext.
	 */
	nameSubtext?: string;

	/**
	 * Icon.
	 */
	icon?: string;

	/**
	 * Symbol to index records state to change on click.
	 *
	 * @remarks
	 * Undefined would mean a disabled button.
	 */
	clickRecordIndex?: string | symbol;
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
			mode?: CompactToolbarMenuItemMode;
	  }
);

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

						/**
						 * Symbol to index records state to change on click.
						 */
						clickRecordIndex?: string | symbol;
					}
			  >
			: never
		: CompactToolbarMenuBaseProps[K1];
};

/**
 * Default menu.
 */
export const defaultCompactToolbarMenu: CompactToolbarMenu = {
	items: [],
	name: "Uninitialized"
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
				return {
					icon: item.icon,
					name: item.name,
					...(item.onClick ? { mode: CompactToolbarMenuItemMode.Click } : {})
				};
			}),
			...rest
		};
	});
}

/**
 * Emits for overlay bus.
 */
export const overlayBusToCompactToolbarMenuEmits: ["updateMenu"] = ["updateMenu"];

/**
 * Emits list for overlay bus.
 */
export type OverlayBusToCompactToolbarMenuEmitsUnion = (typeof overlayBusToCompactToolbarMenuEmits)[any];

/**
 * Validator for overlay bus emit.
 */
type OverlayBusToCompactToolbarMenuEmitHelper<T extends SetupContextEmit<OverlayBusToCompactToolbarMenuEmitsUnion>> = T;

/**
 * Payload for event.
 */
type OverlayBusToCompactToolbarMenuEmitUpdateMenuPayload = Record<"menu", CompactToolbarMenu>;

/**
 * Emit type for overlay bus.
 */
export type OverlayBusToCompactToolbarMenuEmit = OverlayBusToCompactToolbarMenuEmitHelper<{
	(param: "updateMenu", payload: OverlayBusToCompactToolbarMenuEmitUpdateMenuPayload): void;
}>;

/**
 * Converts registry to menu.
 *
 * @param param - Destructured parameter
 * @returns Menu
 */
export function useOverlayBusToCompactToolbarMenuSource({
	usedOverlayBusConsumer,
	name,
	isEmittingUpdateMenu,
	emit
}: {
	/**
	 * Registry.
	 */
	usedOverlayBusConsumer: ReturnType<typeof useOverlayBusConsumer>;

	/**
	 * Name.
	 */
	name: string;
} & (
	| {
			/**
			 * Emit.
			 */
			emit: OverlayBusToCompactToolbarMenuEmit;

			/**
			 * Emit update menu or not.
			 */
			isEmittingUpdateMenu: true;
	  }
	| {
			/**
			 * Emit.
			 */
			emit: Pick<OverlayBusToCompactToolbarMenuEmit, never>;

			/**
			 * Emit update menu or not.
			 */
			isEmittingUpdateMenu: false;
	  }
)): Record<"menu", Ref<CompactToolbarMenu>> {
	// TODO: Add other menu props and unref
	const menu: Ref<CompactToolbarMenu> = computed(() => {
		return {
			items: Array.from(unref(usedOverlayBusConsumer.menuItemsRegistry))
				// ESLint doesn't infer
				// eslint-disable-next-line @typescript-eslint/typedef
				.map(([, item]) => {
					return item;
				})
				.flat(),
			name
		};
	});

	if (isEmittingUpdateMenu) {
		watch(menu, () => emit("updateMenu", { menu: menu.value }), {
			immediate: true
		});
	}

	return { menu };
}

/**
 * Type for {@link useCompactToolbarMenuConsumer} composable, and to be used for more complex objects inside consumer instance.
 */
export type CompactToolbarMenuConsumerEntry = {
	/**
	 * Menu.
	 */
	menu: ShallowRef<CompactToolbarMenu>;

	/**
	 * Update menu callback.
	 */
	onUpdateMenu: (payload: OverlayBusToCompactToolbarMenuEmitUpdateMenuPayload) => void;
};

/**
 * Listens to menu emitted.
 *
 * @returns Composable
 */
export function useCompactToolbarMenuConsumer(): CompactToolbarMenuConsumerEntry {
	let menu: ShallowRef<CompactToolbarMenu> = shallowRef(defaultCompactToolbarMenu);

	/**
	 * Callback for menu update.
	 *
	 * @param param - Destructured parameter
	 */
	function onUpdateMenu({ menu: newMenu }: OverlayBusToCompactToolbarMenuEmitUpdateMenuPayload): void {
		menu.value = newMenu;
	}

	return { menu, onUpdateMenu };
}
