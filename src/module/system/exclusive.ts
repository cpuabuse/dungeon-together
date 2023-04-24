/*
	Copyright 2023 cpuabuse.com
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
export const volumeThreshold: number = 1 as const;

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
		 * @returns Whether the move was successful
		 */
		public moveEntity(cell: ServerCell): boolean {
			let cellVolume: number = Array.from(cell.entities.values())
				.filter(
					(
						entity
					): entity is typeof entity & {
						/**
						 * Kind.
						 */
						kind: ExclusiveKind;
					} => {
						return entity.kind instanceof ExclusiveKind;
					}
				)
				.reduce((acc, entity) => {
					return acc + entity.kind.volume;
				}, 0);

			if (cellVolume + this.volume <= volumeThreshold) {
				return super.moveEntity(cell);
			}
			return false;
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
