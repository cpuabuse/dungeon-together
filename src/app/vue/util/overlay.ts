/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Reuseable props for overlay components.
 *
 * @file
 */

import { PropType } from "vue";
import { ExtractProps } from "../types";

/**
 * Content type used in overlay content.
 */
export enum OverlayContentType {
	Block = "block",
	Menu = "menu"
}

/**
 * Base props for all components of overlay content family.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayContentProps = {
	contentType: {
		default: OverlayContentType.Block,
		type: String as PropType<OverlayContentType>
	}
} as const;

/**
 * `this` type for overlay list methods.
 */
type OverlayListThis = ExtractProps<typeof overlayContentProps> & typeof overlayListMethods;

/**
 * Whether the item is displayed as a menu.
 *
 * @param this - The component instance
 * @returns Whether the item is displayed as a menu
 */
function isMenu(this: OverlayListThis): boolean {
	return this.contentType === OverlayContentType.Menu;
}

/**
 * Methods for components of overlay list family.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const overlayListMethods = {
	isMenu
} as const;
