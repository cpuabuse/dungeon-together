/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * System kind module.
 */

import { ExternalMessageSchema } from "../../app/common/i18n";
import { Locale } from "../../app/common/locale";
import { Module, ModuleFactoryParams } from "../../app/server/module";
import { DoorKindClassFactory } from "./door";
import { ExclusiveKindClass, ExclusiveKindClassFactory } from "./exclusive";
import { FloorKindClassFactory } from "./floor";
import { GuyKindClass, GuyKindClassFactory } from "./guy";
import { ItemKindClassFactory } from "./item";
import { LadderKindClassFactory } from "./ladder";
import { MimicKindClassFactory } from "./mimic";
import { MonsterKindClass, MonsterKindClassFactory } from "./monster";
import { SystemStoryWords } from "./story";
import { TrapKindClass, TrapKindClassFactory } from "./trap";
import { TreasureKindClassFactory } from "./treasure";
import { UnitKindClass, UnitKindClassFactory, UnitStatWords, UnitStats, defaultStats } from "./unit";
import { WallKindClassFactory } from "./wall";

// Destructured bug
// eslint-disable-next-line jsdoc/require-param
/**
 * Module providing system entity kinds.
 *
 * @param param - Destructured parameter
 * @returns System entity kinds
 */
// Destructured type ESLint bug
// eslint-disable-next-line  @typescript-eslint/typedef
export function systemModuleFactory(...[{ universe, props, moduleName }]: ModuleFactoryParams): Module {
	let stats: UnitStats = defaultStats;

	// Set props
	if (props) {
		Object.values(UnitStatWords).forEach(stat => {
			let statValue: unknown = props[stat];
			if (typeof statValue === "number") {
				stats[stat] = statValue;
			}
		});
	}

	/**
	 * System kind, with overriden properties, to enable functionality.
	 */
	class Base extends universe.Entity.BaseKind {
		public static moduleName: string = moduleName;
	}

	const ExclusiveKind: ExclusiveKindClass = ExclusiveKindClassFactory({ Base });
	const UnitKind: UnitKindClass = UnitKindClassFactory({ Base: ExclusiveKind, stats });
	const GuyKind: GuyKindClass = GuyKindClassFactory({ Base: UnitKind, stats });
	// TODO: Target should be allied units
	const TrapKind: TrapKindClass = TrapKindClassFactory({ Base, Targets: [GuyKind], UnitBase: UnitKind });
	const MonsterKind: MonsterKindClass = MonsterKindClassFactory({ Base: UnitKind, stats });

	// Infer type to check other languages
	// eslint-disable-next-line @typescript-eslint/typedef
	const englishMessages = {
		storyNotification: {
			[SystemStoryWords.Sync]: {
				paragraphs: ["Welcome screen in English.", "Second message"]
			}
		}
	} satisfies ExternalMessageSchema;

	/**
	 * Type for validating messages.
	 */
	type LocaleMessages = typeof englishMessages;

	return {
		kinds: {
			ExclusiveKind,
			UnitKind,
			door: DoorKindClassFactory({ Base: ExclusiveKind }),
			floor: FloorKindClassFactory({ Base }),
			gold: ItemKindClassFactory({ Base }).GoldKind,
			guy: GuyKind,
			ladder: LadderKindClassFactory({ Base }),
			mimic: MimicKindClassFactory({ Base: MonsterKind }),
			monster: MonsterKind,
			trap: TrapKind,
			treasure: TreasureKindClassFactory({ Base }),
			wall: WallKindClassFactory({ Base: ExclusiveKind })
		},

		// Translation messages
		messages: {
			[Locale.English]: englishMessages,
			[Locale.Japanese]: {
				storyNotification: {
					[SystemStoryWords.Sync]: {
						paragraphs: ["Welcome screen in Japanese."]
					}
				}
			} satisfies LocaleMessages,
			[Locale.Arabic]: {
				storyNotification: {
					[SystemStoryWords.Sync]: {
						paragraphs: ["Welcome screen in Arabic."]
					}
				}
			} satisfies LocaleMessages
		}
	};
}

/**
 * System entity kind module.
 */
export type SystemEntityKindModule = ReturnType<typeof systemModuleFactory>;
