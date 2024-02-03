/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A monster that looks like a treasure until it is attacked or opened.
 *
 * @file
 */
import { MessageTypeWord, StatusNotificationWord } from "../../app/common/defaults/connection";
import { CoreEnvelope } from "../../app/core/connection";
import { LogLevel } from "../../app/core/error";
import { ActionWords } from "../../app/server/action";
import { ServerPlayer } from "../../app/server/connection";
import {
	EntityKind,
	EntityKindActionArgs,
	EntityKindConstructorParams,
	ServerEntity,
	ServerEntityClass
} from "../../app/server/entity";
import { ServerShard } from "../../app/server/shard";
import { MonsterKind, MonsterKindClass } from "./monster";
import { TreasureKindClassFactory } from "./treasure";

/**
 * Mimic kind factory.
 *
 * The monster has to be received from the loader, so that all the monster have the same base.
 * The treasure class on the other hand will be created within this factory since it has nothing to do with treasure in the system.
 *
 * @param param - Destructured parameter
 * @returns Mimic kind monster class
 */
// Force inference
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function MimicKindClassFactory({
	Base
}: {
	/**
	 * Unit entity.
	 */
	Base: MonsterKindClass;
}) {
	/**
	 * Action rest type.
	 */
	type ActionRest = Omit<EntityKindActionArgs, "action">;

	/**
	 * Merging with monster kind.
	 */
	// Merge with only own members of monster, to avoid protected members inference mismatch (class vs interface)
	// Force merge
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface MimicKindMerge extends Omit<MonsterKind, keyof EntityKind> {}

	/**
	 * Auxiliary class for interface merge, to include monster into prototype.
	 */
	// Force merge
	// eslint-disable-next-line no-redeclare
	class MimicKindMerge extends TreasureKindClassFactory({ Base }) {}

	/**
	 * Mimic-monster class.
	 *
	 * @remarks
	 * `isOpen` within this class means whether the monster is revealed.
	 *
	 * Mimic will attack first if we try to use it and prevent an attack from happening.
	 * When we attack the mimic, we will damage it first and the mimic will skip the attack.
	 */
	class MimicKind extends MimicKindMerge {
		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, hasAction: true };
		}

		/**
		 * Is not hidden property to emit monster specific properties.
		 */
		public isNotHidden: boolean = false;

		/**
		 * Is chasing an enemy or not.
		 */
		public isTracing: boolean = false;

		/**
		 * Open mode UUID.
		 */
		protected readonly openModeUuid: string = "mimic-attack";

		/**
		 * Public constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor({ entity, ...rest }: EntityKindConstructorParams) {
			super({ entity, ...rest });

			// Make mimic stronger
			this.stats.str += 2;
		}

		/**
		 * Action.
		 *
		 * @param param - Destructured parameter
		 * @returns Whether the action was successful
		 */
		public action(param: EntityKindActionArgs): boolean {
			let { action, ...rest }: EntityKindActionArgs = param;
			switch (action) {
				case ActionWords.Interact: {
					// If mimic is open, then we call monster grandparent attack; Otherwise, let parent treasure redirect into use action
					if (this.isOpen) {
						return this.action({ action: ActionWords.Attack, ...rest }); // Placeholder
					}
					return super.action({ action, ...rest });
				}

				case ActionWords.Use: {
					return this.softAwakenAndAttack(rest);
				}

				case ActionWords.Attack: {
					this.awaken(rest);
					return super.action({
						action: ActionWords.Attack,
						...rest
					});
				}

				// We covered all treasure actions so it is safe to pass through the rest
				// Fall through
				default:
					return super.action({ action, ...rest });
			}
		}

		/**
		 * A callback called when another entity is attempting to enter the cell that it occupies, which will awaken the mimic and attack the entity.
		 *
		 * @remarks
		 * Monsters will not pass through the mimic, which is an intentional way for the player to figure out if the treasure is a mimic or not.
		 *
		 * @param sourceEntity - Entity to move
		 */
		public onCellMoveEntity(sourceEntity: ServerEntity): void {
			this.softAwakenAndAttack({ sourceEntity });
		}

		/**
		 * Awaken the mimic. Make it start tracing players and have unit emits appear including health bar.
		 *
		 * @param rest - Destructured parameter
		 * @returns Whether the awakening  was successful
		 */
		private awaken(rest: ActionRest): boolean {
			const { sourceEntity }: ActionRest = rest;
			let result: boolean = false;
			const wasNotOpen: boolean = !this.isOpen;

			if (wasNotOpen) {
				// Awaken
				this.isTracing = true;
				this.isNotHidden = true;

				// Set mode/open
				result = super.action({ action: ActionWords.Use, ...rest });

				// Send message of notification of mimic awakening/attacking
				if (sourceEntity && sourceEntity.playerUuid) {
					const shard: ServerShard = (this.entity.constructor as ServerEntityClass).universe.getShard(sourceEntity);

					// Player controlling the source entity
					const player: ServerPlayer | undefined = shard.players.get(sourceEntity.playerUuid);

					// Check if player exists and if it does, send a message
					if (player && player.connection) {
						player.connection.socket
							.send(
								new CoreEnvelope({
									messages: [
										{
											body: { notificationId: StatusNotificationWord.MimicAwaken, playerUuid: player.playerUuid },
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
				}
			}
			return result;
		}

		/**
		 * Awakens and attacks back if action was performed by enemy faction.
		 *
		 * @param sourceEntity - Destructured parameter
		 * @returns Whether the action was successful
		 */
		private softAwakenAndAttack({ sourceEntity }: ActionRest): boolean {
			let result: boolean = false;
			if (sourceEntity) {
				// TODO: Check enemy faction instead of monster
				if (!(sourceEntity.kind instanceof Base)) {
					result = this.awaken({ sourceEntity });

					// Action is reversed, return is ignored
					sourceEntity.kind.action({
						action: ActionWords.Attack,
						sourceEntity: this.entity
					});
				}
			}

			return result;
		}
	}

	return MimicKind;
}
