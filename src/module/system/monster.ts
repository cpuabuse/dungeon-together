/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Monster.
 *
 * @file
 */

import { ActionWords } from "../../app/server/action";
import { EntityKindConstructorParams, ServerEntity, ServerEntityClass } from "../../app/server/entity";
import { UnitKindClass, UnitStats } from "./unit";

/**
 * Monster kind factory.
 *
 * @param param - Destructured parameter
 * @returns Monster class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MonsterKindClassFactory({
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
	 * Monster class.
	 */
	class MonsterKind extends Base {
		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			this.stats = { ...stats };
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 */
		// Dummy function
		// eslint-disable-next-line class-methods-use-this
		public action({
			action
		}: {
			/**
			 * Action name.
			 */
			action: ActionWords;
		}): void {
			super.action({ action });
			(this.entity.constructor as ServerEntityClass).universe.getCell(this.entity).removeEntity(this.entity);
		}
	}

	return MonsterKind;
}

/**
 * Monster class.
 */
export type MonsterKindClass = ReturnType<typeof MonsterKindClassFactory>;

/**
 * Monster kind instance.
 */
export type MonsterKind = InstanceType<MonsterKindClass>;
