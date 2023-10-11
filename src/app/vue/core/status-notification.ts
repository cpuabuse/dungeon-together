/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/
/**
 * Notification component props.
 *
 * @file
 */

import { inject } from "vue";
import { toCapitalized } from "../../common/text";
import { SetupContextEmit } from "../common/utility-types";
import { Stores, UpdateActionNames, updateActionNames } from "./store";

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
	const { useUpdateActionsStore }: Stores = inject("stores");
	// Infer store type
	// eslint-disable-next-line @typescript-eslint/typedef
	const updateActionsStore = useUpdateActionsStore();

	/**
	 * Helper type for subscribe object.
	 */
	type OnTypeParam = {
		/**
		 * Callback on subscription.
		 */
		callback: () => void;
	};

	/**
	 * Helper type, for subscribe object.
	 */
	type OnType = Record<`on${Capitalize<UpdateActionNames>}`, (param: OnTypeParam) => void>;

	const on: OnType = updateActionNames.reduce((result, actionName) => {
		return {
			...result,
			/**
			 * Subscribe to update action.
			 *
			 * @remarks
			 * Component will unsubscribe from actions automatically on unmount - {@link https://pinia.vuejs.org/core-concepts/actions.html#Subscribing-to-actions}.
			 *
			 * @param param - Destructured parameter
			 */
			[`on${toCapitalized({ text: actionName })}`]({ callback }: OnTypeParam): void {
				// ESLint doesn't infer
				// eslint-disable-next-line @typescript-eslint/typedef
				updateActionsStore.$onAction(({ name }) => {
					if (name === actionName) {
						callback();
					}
				});
			}
		};
	}, {} as OnType);

	/**
	 * Shift player notifications.
	 */
	function shiftPlayerNotifications(): void {
		emit("shiftPlayerNotifications");
	}

	return {
		shiftPlayerNotifications,
		...on
	};
}
