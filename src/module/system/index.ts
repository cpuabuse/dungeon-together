/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * System kind module.
 *
 * @file
 */

import { ModuleFactoryParams } from "../../app/server/module";
import { DoorKindClassFactory } from "./door";
import { ExclusiveKindClass, ExclusiveKindClassFactory } from "./exclusive";
import { FloorKindClassFactory } from "./floor";
import { GuyKindClass, GuyKindClassFactory } from "./guy";
import { LadderKindClassFactory } from "./ladder";
import { MonsterKindClassFactory } from "./monster";
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
// Force inference; Destructured type ESLint bug
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/typedef
export function systemModuleFactory(...[{ universe, props }]: ModuleFactoryParams) {
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

	const ExclusiveKind: ExclusiveKindClass = ExclusiveKindClassFactory({ Base: universe.Entity.BaseKind });
	const UnitKind: UnitKindClass = UnitKindClassFactory({ Base: ExclusiveKind, stats });
	const GuyKind: GuyKindClass = GuyKindClassFactory({ Base: UnitKind, stats });
	// TODO: Target should be allied units
	const TrapKind: TrapKindClass = TrapKindClassFactory({ Base: universe.Entity.BaseKind, Targets: [GuyKind] });

	return {
		kinds: {
			ExclusiveKind,
			UnitKind,
			door: DoorKindClassFactory({ Base: ExclusiveKind }),
			floor: FloorKindClassFactory({ Base: universe.Entity.BaseKind }),
			guy: GuyKind,
			ladder: LadderKindClassFactory({ Base: universe.Entity.BaseKind }),
			monster: MonsterKindClassFactory({ Base: UnitKind, stats }),
			trap: TrapKind,
			treasure: TreasureKindClassFactory({ Base: universe.Entity.BaseKind }),
			wall: WallKindClassFactory({ Base: ExclusiveKind })
		}
	};
}

/**
 * System entity kind module.
 */
export type SystemEntityKindModule = ReturnType<typeof systemModuleFactory>;
