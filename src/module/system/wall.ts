/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Walls etc.
 *
 * @file
 */

import { EntityKindConstructorParams } from "../../app/server/entity";
import { ExclusiveKindClass } from "./exclusive";

/**
 * Wall entity kind.
 *
 * @param param - Destructured parameter
 * @returns New class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function WallKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: ExclusiveKindClass;
}) {
	/**
	 * Wall entity kind class.
	 */
	class WallKind extends Base {
		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}

	return WallKind;
}
