/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Units to be occupying cells within the grid.
 */

import { StatusNotification } from "../../app/client/connection";
import { MessageTypeWord, StatusNotificationWord } from "../../app/common/defaults/connection";
import { CoreEnvelope } from "../../app/core/connection";
import { LogLevel } from "../../app/core/error";
import { ActionWords } from "../../app/server/action";
import { ServerCell } from "../../app/server/cell";
import { ServerPlayer } from "../../app/server/connection";
import {
	EntityKind,
	EntityKindActionArgs,
	EntityKindConstructorParams,
	ServerEntity,
	ServerEntityClass
} from "../../app/server/entity";
import { ServerShard } from "../../app/server/shard";
import { ExclusiveKindClass } from "./exclusive";

/**
 * Words for unit stats.
 */
export enum UnitStatWords {
	Strength = "str",
	Dexterity = "dex",
	Constitution = "con",
	Intelligence = "int",
	Wit = "wit",
	Mental = "men"
}

/**
 * Unit stats.
 */
export type UnitStats = {
	[K in UnitStatWords]: number;
};

/**
 * Words for unit attributes.
 */
enum UnitAttributeWords {
	Damage = "damage",
	Rate = "rate",
	Power = "power",
	Accuracy = "accuracy"
}

/**
 * Roles attributes take.
 */
enum UnitAttributeRoleWords {
	Attack = "attack",
	Defense = "defense"
}

/**
 * Words for damage types.
 */
enum UnitAttributeTypeWords {
	Physical = "physical",
	Magical = "magical",
	Ranged = "ranged",
	Healing = "healing"
}

/**
 * Unique unit attributes.
 */
enum UnitUniqueAttributeWords {
	Health = "health",
	Mana = "mana",
	Stamina = "stamina"
}

/**
 * Helper type.
 * Generates an object per attribute per role.
 */
type PerTypePerRolePerAttribute<T> = {
	[AttributeType in UnitAttributeTypeWords]: {
		[Role in UnitAttributeRoleWords]: {
			[Attribute in UnitAttributeWords]: T;
		};
	};
};

/**
 * Unit resourcesUnique unit attributes.
 */
type UnitResources = {
	[Attribute in UnitUniqueAttributeWords]: number;
};

/**
 * Unit action attributes.
 */
type UnitAttributes = PerTypePerRolePerAttribute<number>;

/**
 * Unit level information.
 */
type UnitLevel = {
	/**
	 * Level.
	 */
	level: number;

	/**
	 * Total experience.
	 */
	experience: number;
};

/**
 * Default stats.
 */
export const defaultStats: UnitStats = Object.values(UnitStatWords).reduce((result, value) => {
	return { ...result, [value]: 0 };
}, {} as UnitStats);

/**
 * Unit factions.
 */
export class UnitFaction extends Set<UnitFaction> {
	/**
	 * Checks if unit belongs to a faction.
	 *
	 * @param param - Destructured parameter
	 * @returns True if unit belongs to a faction
	 */
	public deepHas({
		faction
	}: {
		/**
		 * Faction to check.
		 */
		faction: UnitFaction;
	}): boolean {
		// Quick return if this is the faction we are checking for; Done only on the root call, as subsequent calls will check children first
		if (this === faction) {
			return true;
		}

		// Do we even need to iterate over empty set
		if (this.size === 0) {
			return false;
		}

		return this.internalDeepHas({ faction, factionsChecked: new Set([this]) });
	}

	/**
	 * Checks if unit recursively belongs to a faction.
	 *
	 * @remarks
	 * Written in such a way to minimize recursion deepening.
	 *
	 * @param param - Destructured parameter
	 * @returns True if unit belongs to a faction recursively
	 */
	protected internalDeepHas({
		faction,
		factionsChecked
	}: {
		/**
		 * Faction to check.
		 */
		faction: UnitFaction;

		/**
		 * Factions that have been checked so far in the recursion.
		 */
		factionsChecked: Set<UnitFaction>;
	}): boolean {
		// Have to iterate over set and return method
		// eslint-disable-next-line no-restricted-syntax
		for (let factionToCheck of this) {
			// If faction to check was not checked before
			if (!factionsChecked.has(factionToCheck)) {
				// Quick return if child is target
				if (factionToCheck === faction) {
					return true;
				}
				factionsChecked.add(factionToCheck);

				// Only deepen recursion when there is need to
				if (factionToCheck.size > 0) {
					if (factionToCheck.internalDeepHas({ faction, factionsChecked })) {
						return true;
					}
				}
			}
		}

		// Match not found
		return false;
	}
}

/**
 * Unit entity kind.
 *
 * @param param - Destructured parameter
 * @returns New class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UnitKindClassFactory({
	Base,
	stats
}: {
	/**
	 * Server entity.
	 */
	Base: ExclusiveKindClass;

	/**
	 * Unit stats.
	 */
	stats: UnitStats;
}) {
	/**
	 * Unit entity kind class.
	 */
	class UnitKind extends Base implements UnitLevel {
		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return {
				...super.emits,
				...(this.isNotHidden
					? {
							experience: this.experience,
							hasAction: true,
							hasPhantom: true,
							health: this.healthPoints,
							level: this.level,
							maxHealth: this.maxHealthPoints,
							stats: this.stats
						}
					: {})
			};
		}

		/**
		 * Attack.
		 *
		 * @returns Attack this does
		 */
		public get attack(): number {
			return this.stats.str + this.level;
		}

		/**
		 * CP.
		 */
		public combatPoints: number = 0;

		/**
		 * DF.
		 */
		public defense: number = 0;

		/**
		 * Experience.
		 * If set from YAML should be reverse calculated from level.
		 */
		public experience: number = 0;

		/**
		 * HP.
		 */
		public healthPoints: number = 3;

		/**
		 * Is not hidden property to emit unit specific properties.
		 */
		public isNotHidden: boolean = true;

		/**
		 * LVL.
		 *
		 * @returns Level
		 */
		public get level(): number {
			return 1 + Math.floor(this.experience / 10);
		}

		// Order is important
		/* eslint-disable @typescript-eslint/member-ordering */
		/**
		 * Default faction created once to save on cycles.
		 */
		public static defaultFaction: UnitFaction = new UnitFaction();

		/**
		 * A faction unit belongs to.
		 */
		public faction: UnitFaction = UnitKind.defaultFaction;
		/* eslint-enable @typescript-eslint/member-ordering */

		/**
		 * MP.
		 */
		public manaPoints: number = 0;

		/**
		 * Calc max health based on constitution.
		 *
		 * @returns Max health
		 */
		public get maxHealthPoints(): number {
			return 3 + this.stats.con * 2;
		}

		/**
		 * Speed.
		 */
		public speed: number = 1;

		/**
		 * Factory stats increment.
		 */
		public static stats: UnitStats = { ...stats };

		/**
		 * Unit specific stats bonuses.
		 * To be affected by things like equipment.
		 * Initialized to 0 at first.
		 */
		public stats: UnitStats = { ...defaultStats };

		/**
		 * Strength.
		 */
		public strength: number = 1;

		/**
		 * Entity array to track for ticks.
		 */
		public static units: Set<UnitKind> = new Set();

		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });

			UnitKind.units.add(this);
		}

		/**
		 * Unit on tick.
		 */
		public static onTick(): void {
			if (this === UnitKind) {
				UnitKind.units.forEach(unit => {
					if (unit.healthPoints < unit.maxHealthPoints) {
						// Regenerate some health
						unit.healthPoints = Math.round(10 * unit.healthPoints + 2) / 10;
					}
				});
			}
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action, sourceEntity, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Attack: {
					super.action(param);

					let cell: ServerCell = (this.entity.constructor as ServerEntityClass).universe.getCell(this.entity);

					const sourceKind: EntityKind | undefined = sourceEntity?.kind;
					// To infer predicate
					// eslint-disable-next-line @typescript-eslint/typedef
					const sourceIsUnit = sourceKind instanceof UnitKind;

					if (sourceIsUnit) {
						this.healthPoints -= sourceKind.attack;
						sourceKind.onAttackSource({ damage: sourceKind.attack });
					} else {
						// Temporary do some damage from non units source
						this.healthPoints--;
					}

					// Update cell, since entity dictionary changed
					cell.isUpdated = true;

					if (this.healthPoints <= 0) {
						// Add experience to attacker
						if (sourceIsUnit) {
							sourceKind.experience += this.experience;
						}

						cell.addEvent({ name: "death", targetEntityUuid: this.entity.entityUuid });
						cell.removeEntity(this.entity);
					}
					return true;
				}

				case ActionWords.Interact:
					return this.action({ action: ActionWords.Attack, sourceEntity, ...rest });

				default:
					// Action was not successful
					return false;
			}
		}

		/**
		 * Called when unit was the source of attack.
		 *
		 * @param param - Destructured parameter
		 */
		public onAttackSource({
			damage
		}: {
			/**
			 * Damage dealt.
			 */
			damage: number;
		}): void {
			this.sendStatusNotification?.({
				notificationId: StatusNotificationWord.DamageDealt,
				notificationParameters: { damage }
			});
		}

		/**
		 * The getter for a function, that sends status notification.
		 * May return undefined.
		 * This is an optimization so that preparation of parameters for a function call can be skipped, if return function cannot be executed in principle(`playerUuid` is not associated). In that case undefined is returned and caller statement is skipped.
		 *
		 * @returns Function to send notification
		 */
		public get sendStatusNotification(): undefined | ((param: StatusNotification) => void) {
			let { playerUuid }: ServerEntity = this.entity;

			if (playerUuid) {
				return ({ notificationId, notificationParameters }: StatusNotification): void => {
					const shard: ServerShard = (this.entity.constructor as ServerEntityClass).universe.getShard(this.entity);

					// Player controlling the source entity
					// For some reason `playerUuid` is seen as possibly undefined
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const player: ServerPlayer | undefined = shard.players.get(playerUuid!);

					// Check if player exists and if it does, send a message
					if (player && player.connection) {
						player.connection.socket
							.send(
								new CoreEnvelope({
									messages: [
										{
											body: { notificationId, notificationParameters, playerUuid: player.playerUuid },
											type: MessageTypeWord.StatusNotification
										}
									]
								})
							)
							.catch(error => {
								(this.entity.constructor as ServerEntityClass).universe.log({
									error: new Error(
										`Failed to notify about mimic("entityUuid=${this.entity.entityUuid}" to player("playerUuid=${player.playerUuid}").`,
										{ cause: error instanceof Error ? error : undefined }
									),
									level: LogLevel.Warning
								});
							});
					}
				};
			}

			return undefined;
		}

		/**
		 * Terminates unit.
		 */
		public onTerminateEntity(): void {
			super.onTerminateEntity();
			UnitKind.units.delete(this);
		}
	}
	return UnitKind;
}

/**
 * Unit class.
 */
export type UnitKindClass = ReturnType<typeof UnitKindClassFactory>;

/**
 * Unit kind instance.
 */
export type UnitKind = InstanceType<UnitKindClass>;
