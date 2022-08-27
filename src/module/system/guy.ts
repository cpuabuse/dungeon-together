/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Guy.
 *
 * @file
 */

import { EntityKindConstructorParams } from "../../app/server/entity";
import { UnitKindClass, UnitStats } from "./unit";

/**
 * Guy kind factory.
 *
 * @param param - Destructured parameter
 * @returns Guy class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function GuyKindClassFactory({
	Base,
	stats
}: {
	/**
	 * Unit entity.
	 */
	Base: UnitKindClass;

	/**
	 * Unit stats.
	 */
	stats: UnitStats;
}) {
	/**
	 * Guy class.
	 */
	class GuyKind extends Base {
		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			this.stats = { ...stats };
		}
	}

	return GuyKind;
}

/**
 * Guy class.
 */
export type GuyKindClass = ReturnType<typeof GuyKindClassFactory>;

/**
 * Guy kind instance.
 */
export type GuyKind = InstanceType<GuyKindClass>;
