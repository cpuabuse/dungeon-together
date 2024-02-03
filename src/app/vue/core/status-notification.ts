/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/
/**
 * Notification component props.
 *
 * @file
 */

import { SetupContextEmit } from "../common/utility-types";

/**
 * Status notification emits array.
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
export const statusNotificationEmits: ["shiftPlayerNotifications"] = ["shiftPlayerNotifications"];

/**
 * Status notification emits type.
 *
 * @param param - Destructured parameters
 * @returns Status notification emits type
 */
// Force inference for vue
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useStatusNotification({
	emit
}: {
	/**
	 * Emit handler.
	 */
	emit: SetupContextEmit<(typeof statusNotificationEmits)[any]>;
}) {
	/**
	 * Shift player notifications.
	 */
	function shiftPlayerNotifications(): void {
		emit("shiftPlayerNotifications");
	}

	return {
		shiftPlayerNotifications
	};
}
