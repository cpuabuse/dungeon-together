/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * System kind module.
 *
 * @file
 */

import { ModuleFactoryParams } from "../../app/server/module";
import { ExclusiveKindClass, ExclusiveKindClassFactory } from "./exclusive";
import { TrapKindClass, TrapKindClassFactory } from "./trap";
import { UnitKindClassFactory, UnitStatWords, UnitStats } from "./unit";
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
	let stats: UnitStats = Object.values(UnitStatWords).reduce((result, value) => {
		return { ...result, [value]: 0 };
	}, {} as UnitStats);

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
	const TrapKind: TrapKindClass = TrapKindClassFactory({ Base: universe.Entity.BaseKind });

	return {
		kinds: {
			ExclusiveKind,
			TrapKind,
			UnitKind: UnitKindClassFactory({ Base: ExclusiveKind, stats }),
			WallKind: WallKindClassFactory({ Base: ExclusiveKind })
		}
	};
}

/**
 * System entity kind module.
 */
export type SystemEntityKindModule = ReturnType<typeof systemModuleFactory>;
