/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Floor.
 *
 * @file
 */

import { EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

/**
 * Floor kind factory.
 *
 * @param param - Destructured parameter
 * @returns Floor kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function FloorKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Floor.
	 */
	class FloorKind extends Base {
		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}
	return FloorKind;
}

/**
 * Floor class.
 */
export type FloorKindClass = ReturnType<typeof FloorKindClassFactory>;

/**
 * Floor kind.
 */
export type FloorKind = InstanceType<FloorKindClass>;
