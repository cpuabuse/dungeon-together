/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe definitions
 */

import { ConcreteConstructor } from "../../common/utility-types";
import { CoreArg, CoreArgContainer, CoreArgContainerArg, CoreArgIds, CoreArgObjectWords, CoreArgPath } from "../arg";
import { CoreBaseClassNonRecursive } from "../base";
import { CoreUniverseObjectArgsOptionsUnion } from "./options";
import {
	CoreUniverseObjectConstructorParameters,
	CoreUniverseObjectInstance,
	CoreUniverseObjectStatic
} from "./universe-object";

/**
 * A universe constraint from perspective of universe object.
 *
 * @remarks
 * For class, this is to be treated like more of a constructor, an object that creates us universe objects, and does not have static type information.
 */
export type CoreUniverseObjectUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	Instance extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildArg, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg extends CoreArgContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = {
	[K in `get${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
		path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
	) => Instance;
} & {
	// Cannot use class type, since constructor must return exactly provided generic
	[K in `${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: CoreUniverseObjectStatic<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildArg,
		ChildId
	> &
		ConcreteConstructor<
			CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>,
			Instance
		>;
};
