/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe definitions
 */

import { ConcreteConstructor } from "../../common/utility-types";
import { CoreArg, CoreArgIds, CoreArgObjectWords, CoreArgPath } from "../arg";
import { CoreBaseClassNonRecursive } from "../base";
import { CoreUniverseObjectArgsOptionsUnion } from "./options";
import { CoreUniverseObjectConstructorParameters, CoreUniverseObjectInstance } from "./universe-object";

/**
 * A universe constraint from perspective of universe object.
 *
 * @remarks
 * For class, this is to be treated like more of a constructor, an object that creates us universe objects, and does not have static type information.
 */
export type CoreUniverseObjectUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	ChildUniverseObject extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = {
	[K in `get${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
		path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
	) => ChildUniverseObject;
} & {
	[K in `${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: ConcreteConstructor<
		CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>,
		ChildUniverseObject
	>;
};
