/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Guy.
 *
 * @file
 */

import { ServerCell } from "../../app/server/cell";
import { ServerPlayer } from "../../app/server/connection";
import { EntityKindConstructorParams, ServerEntityClass } from "../../app/server/entity";
import { ServerShard } from "../../app/server/shard";
import { UnitKindClass, UnitStats } from "./unit";

/**
 * Guy kind factory.
 *
 * @param param - Destructured parameter
 * @returns Guy class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function GuyKindClassFactory({
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
	 * Guy class.
	 */
	class GuyKind extends Base {
		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			let cell: ServerCell = (this.entity.constructor as ServerEntityClass).universe.getCell(this.entity);

			// TODO: X, Y, Z should be in control unit kind
			return { ...super.emits, gridUuid: this.entity.gridUuid, x: cell.x, y: cell.y, z: cell.z };
		}

		/** Player. */
		public player: ServerPlayer;

		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });
			this.stats = { ...stats };

			// Set base stats
			this.stats.con = 5;

			// TODO: Use appropriate UUID generator function
			this.player = new ServerPlayer({ playerUuid: `player/${this.entity.entityUuid}` });

			// Set unit (for info exchange)
			this.player.units.add(this.entity.entityUuid);

			// Set dictionary
			this.player.dictionary.units = [this.entity.entityUuid];
		}

		/**
		 * On entity creation.
		 */
		public onCreateEntity(): void {
			// Super
			super.onCreateEntity();

			// Important to not do it in constructor, since universe will return shard only after that
			let shard: ServerShard = (this.entity.constructor as ServerEntityClass).universe.getShard(this.entity);

			// Register to shard
			shard.players.set(this.player.playerUuid, this.player);

			// Set unit (for screen update/control)
			shard.units.set(this.entity.entityUuid, this.entity);
		}
	}

	return GuyKind;
}

/**
 * Guy class.
 */
export type GuyKindClass = ReturnType<typeof GuyKindClassFactory>;

/**
 * Guy kind instance.
 */
export type GuyKind = InstanceType<GuyKindClass>;
