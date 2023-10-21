/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Story notification composables.
 *
 * @file
 */

import { StoryNotification } from "../../client/connection";

/**
 * Type for story notification display.
 */
export type StoryNotificationEntry = Pick<StoryNotification, "moduleId" | "notificationId">;
