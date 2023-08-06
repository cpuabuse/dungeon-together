/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A monster that looks like a treasure until it is attacked or opened.
 *
 * @file
 */
import { ActionWords } from "../../app/server/action";
import { EntityKindActionArgs, EntityKindConstructorParams } from "../../app/server/entity";
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
	 * Merging with monster kind.
	 */
	// Force merge
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface MimicKindMerge extends MonsterKind {}

	/**
	 * Auxiliary class for interface merge, to include monster into prototype.
	 */
	// Force merge
	// eslint-disable-next-line no-redeclare
	class MimicKindMerge extends TreasureKindClassFactory({ Base }) {}

	/**
	 * Mimic-monster class.
	 *
	 * `isOpen` within this class means whether the monster is revealed.
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
					// If mimic is open, then it can not be used as it is a monster and if it is closed, then we awaken it
					if (this.isOpen) {
						return false;
					}

					// Awaken
					this.awaken();

					// Attack back if player attempts to use
					rest.sourceEntity?.kind.action({
						action: ActionWords.Attack,
						sourceEntity: this.entity
					});

					return super.action({ action, ...rest });
				}

				case ActionWords.Attack: {
					this.awaken();
				}

				// We covered all treasure actions so it is safe to pass through the rest
				// Fall through
				default:
					return super.action({ action, ...rest });
			}
		}

		/**
		 * Awaken the mimic. Make it start tracing players and have unit emits appear including health bar.
		 */
		private awaken(): void {
			this.isTracing = true;
			this.isNotHidden = true;
		}
	}

	return MimicKind;
}
