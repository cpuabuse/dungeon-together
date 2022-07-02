/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Contains a class factory, that provides exclusive kind, meaning that entities cannot populate same cell.
 *
 * @file
 */

import { ServerCell } from "../../app/server/cell";
import { EntityKindClass, EntityKindConstructorParams } from "../../app/server/entity";

/**
 * Volume threshold for exclusive kind.
 */
const volumeThreshold: number = 1 as const;

/**
 * Exclusive kind factory.
 *
 * @param param - Destructured parameter
 * @returns Exclusive kind class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ExclusiveKindClassFactory({
	Base
}: {
	/**
	 * Server entity.
	 */
	Base: EntityKindClass;
}) {
	/**
	 * Exclusive kind class.
	 */
	class ExclusiveKind extends Base {
		/**
		 * Volume an entity occupies on a cell.
		 */
		public volume: number = volumeThreshold;

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
		}

		/**
		 * Moves entity to cell.
		 *
		 * @param cell - Target cell
		 */
		public moveEntity(cell: ServerCell): void {
			let cellVolume: number = (
				Array.from(cell.entities.values()).filter(entity => {
					return entity instanceof ExclusiveKind;
					// Array just filtered to subclasses
				}) as unknown as Array<ExclusiveKind>
			).reduce((acc, entity) => {
				return acc + entity.volume;
			}, 0);

			if (cellVolume + this.volume <= volumeThreshold) {
				super.moveEntity(cell);
			}
		}
	}

	return ExclusiveKind;
}

/**
 * Exclusive class.
 */
export type ExclusiveKindClass = ReturnType<typeof ExclusiveKindClassFactory>;

/**
 * Exclusive kind.
 */
export type ExclusiveKind = InstanceType<ExclusiveKindClass>;
