/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Units to be occupying cells within the grid.
 *
 * @file
 */

import { EntityKindClassFactory, EntityKindConstructorParams } from "../entity";

/**
 * Unit entity kind.
 *
 * @param param - Destructured parameter
 * @returns New class
 */
// Parameters inferred
// eslint-disable-next-line @typescript-eslint/typedef
export const UnitKindClassFactory: EntityKindClassFactory = function ({ Entity }) {
	/**
	 * Unit entity kind class.
	 */
	class UnitKind extends Entity.BaseKind {
		/**
		 * Attack.
		 */
		public attack: number = 0;

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
		 * @override
		 */
		public static isStackable: boolean = false;

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
		 * Strength.
		 */
		public strength: number = 1;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}
	return UnitKind;
};
