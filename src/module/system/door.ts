/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Door.
 *
 * @file
 */

import { ActionWords } from "../../app/server/action";
import { EntityKindActionArgs, EntityKindConstructorParams } from "../../app/server/entity";
import { ExclusiveKindClass } from "./exclusive";

/**
 * Door entity kind.
 *
 * @param param - Destructured parameter
 * @returns Door class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function DoorKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: ExclusiveKindClass;
}) {
	/**
	 * Door entity kind class.
	 */
	class DoorKind extends Base {
		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, hasAction: !this.isOpen };
		}

		/** Whether the door is open. */
		public isOpen: boolean = false;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			// To open the door
			this.volume = 0;
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether the action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Use: {
					this.isOpen = !this.isOpen;
					if (this.isOpen) {
						this.entity.modeUuid = "door-open";
					} else {
						this.entity.modeUuid = "mode/user/door/default";
					}
					return true;
				}

				case ActionWords.Interact: {
					return this.action({ action: ActionWords.Use, ...rest });
				}

				default:
					return super.action({ action, ...rest });
			}
		}
	}

	return DoorKind;
}

/**
 * Door class.
 */
export type DoorKindClass = ReturnType<typeof DoorKindClassFactory>;

/**
 * Door kind.
 */
export type DoorKind = InstanceType<DoorKindClass>;
