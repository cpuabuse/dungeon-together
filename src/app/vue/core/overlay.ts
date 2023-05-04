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
 * Base props for all components of overlay content family.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListProps = {
	contentType: {
		default: OverlayListType.Block,
		type: String as PropType<OverlayListType>
	}
} as const;

/**
 * Prop types for overlay list family.
 */
export type OverlayListProps = ExtractPropTypes<typeof overlayListProps>;

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
	props: OverlayListProps;
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

	return {
		isCardWrapped,
		isCompact,
		isMenu
	};
}
