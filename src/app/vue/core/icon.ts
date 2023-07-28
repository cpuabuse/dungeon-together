/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { PropType } from "vue";
import { Uuid } from "../../common/uuid";
import { ExtractProps } from "../common/utility-types";

/**
 * Icon props.
 */
// Extract type
// eslint-disable-next-line @typescript-eslint/typedef
export const iconProps = {
	icon: {
		required: false,
		type: String as PropType<string>
	},

	modeUuid: {
		required: false,
		type: String as PropType<Uuid>
	}
} as const;

/**
 * Icon props type.
 */
export type IconProps = ExtractProps<typeof iconProps>;
