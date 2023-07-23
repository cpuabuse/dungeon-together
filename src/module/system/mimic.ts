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
import { EntityKindActionArgs } from "../../app/server/entity";
import { MonsterKindClass } from "./monster";
import { TreasureKindClassFactory } from "./treasure";
import { UnitStats } from "./unit";

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
	Base,
	stats
}: {
	/**
	 * Unit entity.
	 */
	Base: MonsterKindClass;

	/**
	 * Unit stats.
	 */
	stats: UnitStats;
}) {
	/**
	 * Mimic-monster class.
	 *
	 * `isOpen` within this class means whether the monster is revealed.
	 */
	class MimicKind extends TreasureKindClassFactory({ Base }) {
		/**
		 * Emits health.
		 *
		 * @returns Emitted object
		 */
		public get emits(): Record<string, any> {
			return { ...super.emits, hasAction: true };
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
					if (this.isOpen) {
						return true; // Placeholder
					}
					return false; // Placeholder
				}
				case ActionWords.Use: {
					if (this.isOpen) {
						return true; // Placeholder
					}
					return false; // Placeholder
				}
				default:
					return super.action({ action, ...rest });
			}
		}
	}

	return MimicKind;
}
