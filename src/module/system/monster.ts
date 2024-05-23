/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Monster.
 *
 * @file
 */

// TODO: Use visibility
import { v4 } from "uuid";
import { DeferredPromise } from "../../app/common/async";
import { Nav } from "../../app/core/arg";
import { ActionWords } from "../../app/server/action";
import { ServerCell } from "../../app/server/cell";
import { EntityKindConstructorParams, ServerEntityClass } from "../../app/server/entity";
import { UnitFaction, UnitKind, UnitKindClass, UnitStats } from "./unit";

/**
 * Cell view distance.
 */
// TODO: Use visibility
const monsterCellViewDistance: number = 4;

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
		 *  Monster faction.
		 */
		public static faction: UnitFaction = new UnitFaction();

		/**
		 * Is chasing an enemy or not.
		 */
		public isTracing: boolean = true;

		/**
		 * Entity array to track for ticks.
		 */
		public static monsters: Set<MonsterKind> = new Set();

		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			this.stats = { ...stats };

			// Override faction
			this.faction = MonsterKind.faction;

			// Add experience
			this.experience = 2;

			MonsterKind.monsters.add(this);
		}

		/**
		 * On tick.
		 */
		public static onTick(): void {
			if (this === MonsterKind) {
				// Creation of unit entries is essentially when monsters decide what to do, together at same time; So that if during another monster behavior the units change cells, the monster would now know about it already
				let unitEntries: Array<[UnitKind, ServerCell]> = Array.from(this.units).map(unitKind => [
					unitKind,
					(unitKind.entity.constructor as ServerEntityClass).universe.getCell(unitKind.entity)
				]);

				this.monsters.forEach(monsterKind => {
					if (monsterKind.isTracing) {
						let monsterCell: ServerCell = (monsterKind.entity.constructor as ServerEntityClass).universe.getCell(
							monsterKind.entity
						);
						// ESLint false negative
						// eslint-disable-next-line @typescript-eslint/typedef
						let targetUnitEntry: [UnitKind, ServerCell] | undefined = unitEntries.find(([unitKind, targetCell]) => {
							if (!(unitKind instanceof this)) {
								if (
									Math.abs(monsterCell.x - targetCell.x) < monsterCellViewDistance &&
									Math.abs(monsterCell.y - targetCell.y) < monsterCellViewDistance &&
									monsterCell.z === targetCell.z
								) {
									// TODO: For now targeting the closest unit
									return true;
								}
							}
							return false;
						});

						// Possible movement options, in order of angle to target increase if graphed
						// Const infer
						// eslint-disable-next-line @typescript-eslint/typedef
						let navFreedom = [Nav.Left, Nav.YUp, Nav.Right, Nav.YDown] as const;
						// Indexes relation between angle to target and nav to take; Remove one π, since the minimal angle is such
						let angleIndex: Array<[number, Nav]> = navFreedom.map((nav, index) => [(Math.PI / 2) * (index - 2), nav]);
						// Offset for an angle, since that much of the angle above actual angle should still count for same nav; Essentially rotating
						const angleOffset: number = Math.PI / 4;

						if (targetUnitEntry) {
							let [targetUnitKind, targetCell]: [UnitKind, ServerCell] = targetUnitEntry;
							// Atan sign, position matters
							let angle: number = Math.atan2(targetCell.y - monsterCell.y, targetCell.x - monsterCell.x);
							// Direction aligned angle for indexing
							let correctedAngle: number = angle - angleOffset;

							// ESLint false negative
							// eslint-disable-next-line @typescript-eslint/typedef
							let nav: Nav = (angleIndex.find(([angleLimit]) => {
								return correctedAngle === angleLimit ? Math.random() > 0.5 : correctedAngle <= angleLimit;
								// Always defined, from `navFreedom`
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							}) ?? angleIndex[0]!)[1];

							if (monsterCell.nav.get(nav)?.cellUuid === targetCell.cellUuid) {
								// Attack target
								targetUnitKind.action({
									action: ActionWords.Attack,
									sourceEntity: monsterKind.entity
								});
							} else {
								// Navigate to target
								monsterKind.navigateEntity({
									nav
								});
							}
						} else {
							monsterKind.navigateEntity({
								// Always defined
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								nav: [Nav.Left, Nav.Right, Nav.YDown, Nav.YUp][Math.floor(Math.random() * 4)]!
							});
						}
					}
				});
			}
		}

		/**
		 * Death of monster.
		 */
		public die(): void {
			// Drop a coin
			let cell: ServerCell = (this.entity.constructor as ServerEntityClass).universe.getCell(this.entity);
			let created: DeferredPromise<void> = new DeferredPromise();
			let attachHook: Promise<void> = new Promise<void>((resolve, reject) => {
				// TODO: Synchronize with connection queue
				// Position into correct queue
				(this.entity.constructor as ServerEntityClass).universe.universeQueue.addCallback({
					/**
					 * Callback.
					 */
					callback: () => {
						cell.addEntity(
							{
								cellUuid: cell.cellUuid,
								entityUuid: v4(),
								gridUuid: cell.gridUuid,
								// TODO: Extract proper kind UUID from the module
								kindUuid: "kind/system/gold",
								// TODO: Implement mode generation by kind; Potentially remove mode UUID argument requirement
								modeUuid: "gold",
								shardUuid: cell.shardUuid,
								worldUuid: this.entity.worldUuid
							},
							{ attachHook, created },
							[]
						);
						created
							.catch(error => {
								reject(
									new Error(
										`"Could not drop a coin in universe with UUID "${
											(this.entity.constructor as ServerEntityClass).universe.universeUuid
										}".`,
										{ cause: error instanceof Error ? error : undefined }
									)
								);
							})
							.finally(() => {
								resolve();
							});
					}
				});
			});

			// Call super
			super.die();
		}

		/**
		 * Terminates monster.
		 */
		public onTerminateEntity(): void {
			super.onTerminateEntity();
			MonsterKind.monsters.delete(this);
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
