/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Ways to extends entities.
 */

import { StoryNotification } from "../../client/connection";
import { MessageTypeWord } from "../../common/defaults/connection";
import { Uuid } from "../../common/uuid";
import { Nav } from "../../core/arg";
import { CoreEnvelope } from "../../core/connection";
import { LogLevel } from "../../core/error";
import { ActionWords } from "../action";
import { ServerCell } from "../cell";
import { ServerPlayer } from "../connection";
import { ServerGrid } from "../grid";
import { ServerShard } from "../shard";
import { ServerUniverse } from "../universe";
import { ServerEntity, ServerEntityClass } from "./entity";

/**
 * A type that shares params between class factory and constructor.
 */
type EntityKindParams = {
	/**
	 * Kind props.
	 */
	props?: Record<string, unknown>;

	/**
	 * Vars is a record of UUIDs to be used in the kind, converted from IDs in files.
	 */
	vars?: Record<string, Uuid>;
};

/**
 * Parameters for entity kind action.
 */
export type EntityKindActionArgs = {
	/**
	 * Action name.
	 */
	action: ActionWords;

	/**
	 * Source server entity.
	 */
	sourceEntity?: ServerEntity;

	/**
	 * Tool used in action.
	 */
	toolEntity?: ServerEntity;
};

/**
 * Constructor parameters for {@link EntityKind}.
 */
export type EntityKindConstructorParams = {
	/**
	 * Entity.
	 */
	entity: ServerEntity;

	/**
	 * Kind props.
	 */
	props?: Record<string, unknown>;

	/**
	 * Vars is a record of UUIDs to be used in the kind, converted from IDs in files.
	 */
	vars?: Record<string, Uuid>;
};

/**
 * Factory for base kind.
 *
 * @param param - Destructured parameter
 * @returns Base kind class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function BaseEntityKindClassFactory({
	Entity
}: {
	/**
	 * Server entity class.
	 */
	Entity: ServerEntityClass;
}) {
	/**
	 * Entity kind.
	 *
	 * @remarks
	 * The parameters are identical between all kinds, and we treat base kind and concrete kinds identically, for simplicity.
	 *
	 * For the similar reason, the class is not abstract.
	 */
	class BaseKind implements EntityKindParams {
		/**
		 * Server entity class.
		 *
		 * @remarks
		 * Even though entity class is accessible through entity constructor, it might be necessary to access it from a static method.
		 */
		public static Entity: ServerEntityClass = Entity;

		/**
		 * Per entity emits, that will be sent to client, to be interpreted.
		 *
		 * @remarks
		 * Must be a getter, so that getter inheritance works.
		 *
		 * @returns Empty object
		 */
		// A dummy
		// eslint-disable-next-line class-methods-use-this
		public get emits(): Record<string, any> {
			return {};
		}

		/**
		 * Link to entity.
		 */
		public entity: ServerEntity;

		/**
		 * Whether the entity is visible or not.
		 */
		public isVisible: boolean = true;

		/**
		 * Optional module ID.
		 */
		public static moduleName?: string;

		/**
		 * Props.
		 */
		public props: EntityKindParams["props"];

		/**
		 * Vars.
		 */
		public vars: EntityKindParams["vars"];

		/**
		 * @param param - Destructured parameter
		 */
		public constructor({ entity }: EntityKindConstructorParams) {
			this.entity = entity;
		}

		/**
		 * Per-kind on tick method.
		 *
		 * @remarks
		 * Should not call super, as registered kinds will all be ticked, including base.
		 * Should be called in order of registration.
		 * Should typically be guarded by class and `this` comparison, to avoid being called twice through classes not overriding.
		 */
		public static onTick(): void {
			// Do nothing
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether action was successful
		 */
		// Dummy function
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public action(param: EntityKindActionArgs): boolean {
			// Does nothing
			return false;
		}

		/**
		 * Attempts to move the server entity.
		 *
		 * @remarks
		 * Not to be overridden, this is a wrapper for {@link this.doMoveEntity}.
		 *
		 * @param targetCell - Cell
		 * @returns Whether move was successful
		 */
		public moveEntity(targetCell: ServerCell): boolean {
			let result: boolean = this.doMoveEntity(targetCell);
			targetCell.entities.forEach(targetEntity => {
				if (targetEntity !== this.entity) {
					targetEntity.kind.onCellMoveEntity(this.entity);
				}
			});
			return result;
		}

		/**
		 * Tries to move entity via navigation.
		 *
		 * @param param - Destructured parameter
		 */
		public navigateEntity({
			nav
		}: {
			/**
			 * Nav direction.
			 */
			nav: Nav;
		}): void {
			const { universe }: Record<"universe", ServerUniverse> = this.entity.constructor as ServerEntityClass;
			const grid: ServerGrid = universe.getGrid(this.entity);
			const sourceCell: ServerCell = universe.getCell(this.entity);
			const targetCell: ServerCell = grid.getCell(sourceCell.nav.get(nav) ?? this.entity);
			if (this.moveEntity(targetCell)) {
				sourceCell.addEvent({
					name: "trail",
					targetCellUuid: targetCell.cellUuid,
					targetEntityUuid: this.entity.entityUuid
				});
			}
		}

		/**
		 * Will be called on attachment of entity.
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this
		public onAttachEntity(): void {
			// Does nothing
		}

		/**
		 * Will be called once another entity is attached to the same cell.
		 *
		 * @param entity - Entity that was attached to the cell
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public onCellAttachEntity(entity: ServerEntity): void {
			// Does nothing
		}

		/**
		 * Will be called once another entity is detached from the same cell.
		 *
		 * @param entity - Entity that will be detached from the cell
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public onCellDetachEntity(entity: ServerEntity): void {
			// Does nothing
		}

		/**
		 * Callback to be executed when another entity moves to the cell, this entity occupies.
		 *
		 * @remarks
		 * Should be called after movement was executed so that this method can figure out if it was successful or not by cell contents.
		 * Should be called regardless of movement being successful or not.
		 *
		 * @param entity - Entity that will attempt to move to the cell
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
		public onCellMoveEntity(entity: ServerEntity): void {
			// Does nothing
		}

		/**
		 * Will be called on creation of entity.
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this
		public onCreateEntity(): void {
			// Does nothing
		}

		/**
		 * Will be called on detachment of entity.
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this
		public onDetachEntity(): void {
			// Does nothing
		}

		/**
		 * Will be called on termination of entity.
		 */
		// Here just to show the function to extending classes
		// eslint-disable-next-line class-methods-use-this
		public onTerminateEntity(): void {
			// Does nothing
		}

		/**
		 * Sends story notification to client, relative to module.
		 * Can be called from class extending this, to invoke from parent module scope.
		 *
		 * @example Parent module scope invocation
		 * ```typescript
		 * Object.getPrototypeOf(this).sendStatusNotification(param);
		 * ```
		 *
		 * @param param - Destructured parameter
		 */
		public sendStoryNotification({ notificationId, parameters }: Omit<StoryNotification, "moduleName">): void {
			let { moduleName }: EntityKindClass = this.constructor as EntityKindClass;
			let { playerUuid }: ServerEntity = this.entity;

			if (playerUuid && moduleName) {
				const shard: ServerShard = (this.entity.constructor as ServerEntityClass).universe.getShard(this.entity);

				// Player controlling the source entity
				const player: ServerPlayer | undefined = shard.players.get(playerUuid);

				// Check if player exists and if it does, send a message
				if (player && player.connection) {
					player.connection.socket
						.send(
							new CoreEnvelope({
								messages: [
									{
										body: {
											moduleName,
											notificationId,
											parameters,
											playerUuid
										},
										type: MessageTypeWord.StoryNotification
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
			}
		}

		/**
		 * Actually moves the server entity.
		 *
		 * @param targetCell - Cell
		 * @returns Whether move was successful
		 */
		protected doMoveEntity(targetCell: ServerCell): boolean {
			// Docs not necessary for const type
			// eslint-disable-next-line jsdoc/require-jsdoc
			const { entity }: { entity: ServerEntity } = this;

			// Reattach; Attach will update uuids in core
			(this.entity.constructor as ServerEntityClass).universe.getCell(entity).detachEntity(entity);
			targetCell.attachEntity(entity);

			return true;
		}
	}

	return BaseKind;
}

/**
 * Entity kind class.
 */
export type EntityKindClass = ReturnType<typeof BaseEntityKindClassFactory>;

/**
 * Instance type of entity kind class.
 */
export type EntityKind = InstanceType<EntityKindClass>;
