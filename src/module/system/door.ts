/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Door.
 *
 * @file
 */

import { EntityKindConstructorParams } from "../../app/server/entity";
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
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			// To open the door
			this.volume = 0;
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
