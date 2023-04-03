/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Units to be occupying cells within the grid.
 *
 * @file
 */

import { ActionWords } from "../../app/server/action";
import { EntityKindActionArgs, EntityKindConstructorParams, ServerEntityClass } from "../../app/server/entity";
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
	Damage = "attack",
	Rate = "rate",
	Power = "power"
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
 * Unit attributes.
 */
export type UnitAttributes = {
	[Attribute in UnitUniqueAttributeWords]: number;
} & {
	[AttributeType in UnitAttributeTypeWords]: {
		[Role in UnitAttributeRoleWords]: {
			[Attribute in UnitAttributeWords]: number;
		};
	};
};

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
			return { ...super.emits, hasAction: true, health: this.healthPoints };
		}

		/**
		 * Attack.
		 */
		public attack: number = 1;

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
		 * LVL.
		 *
		 * @returns Level
		 */
		public get level(): number {
			return 1 + this.experience;
		}

		/**
		 * MP.
		 */
		public manaPoints: number = 0;

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
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		// Dummy function
		// eslint-disable-next-line class-methods-use-this
		public action(param: EntityKindActionArgs): boolean {
			let { action, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Attack:
					super.action(param);
					this.healthPoints--;
					if (this.healthPoints <= 0) {
						(this.entity.constructor as ServerEntityClass).universe.getCell(this.entity).removeEntity(this.entity);
					}
					return true;

				case ActionWords.Interact:
					return this.action({ action: ActionWords.Attack, ...rest });

				default:
					// Action was not successful
					return false;
			}
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
