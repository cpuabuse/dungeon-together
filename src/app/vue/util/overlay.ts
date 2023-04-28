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
