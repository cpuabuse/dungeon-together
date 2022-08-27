/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Units to be occupying cells within the grid.
 *
 * @file
 */

import { EntityKindConstructorParams } from "../../app/server/entity";
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
	class UnitKind extends Base {
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
		 * HP.
		 */
		public healthPoints: number = 1;

		/**
		 * LVL.
		 */
		public level: number = 1;

		/**
		 * MP.
		 */
		public manaPoints: number = 0;

		/**
		 * Speed.
		 */
		public speed: number = 1;

		/**
		 * Props for unit.
		 */
		public stats: UnitStats = { ...stats };

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
