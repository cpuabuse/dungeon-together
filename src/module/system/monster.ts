/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Monster.
 *
 * @file
 */

import { Nav } from "../../app/core/arg";
import { CellPathOwn } from "../../app/core/cell";
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
		 * Entity array to track for ticks.
		 */
		public static entities: Set<ServerEntity> = new Set();

		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			this.stats = { ...stats };

			MonsterKind.entities.add(this.entity);
		}

		/**
		 * On tick.
		 */
		public static onTick(): void {
			Base.onTick();
			// TODO: Write a better AI
			this.entities.forEach(entity => {
				if (Math.random() > 0.5) {
					let nav: CellPathOwn | undefined = (entity.constructor as ServerEntityClass).universe
						.getCell(entity)
						.nav.get([Nav.Left, Nav.Right, Nav.YDown, Nav.YUp, Nav.Left][Math.floor(Math.random() * 4)]);
					if (nav) {
						entity.kind.moveEntity((entity.constructor as ServerEntityClass).universe.getGrid(entity).getCell(nav));
					}
				}
			});
		}

		/**
		 * Terminates monster.
		 */
		public onTerminateEntity(): void {
			super.onTerminateEntity();
			MonsterKind.entities.delete(this.entity);
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
