/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Contains a class factory, that provides exclusive kind, meaning that entities cannot populate same cell.
 *
 * @file
 */

import { EntityKindClassFactory, EntityKindConstructorParams } from "../entity";

/**
 * Exclusive kind factory.
 *
 * @param param - Destructured parameter
 * @returns Exclusive kind class
 */
// Parameters inferred
// eslint-disable-next-line @typescript-eslint/typedef
export const ExclusiveKindClassFactory: EntityKindClassFactory = function ({ Entity }) {
	/**
	 * Exclusive kind class.
	 */
	class ExclusiveKind extends Entity.BaseKind {
		/**
		 * Volume an entity occupies on a cell.
		 */
		public volume: number = 1;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}
	}

	return ExclusiveKind;
};
