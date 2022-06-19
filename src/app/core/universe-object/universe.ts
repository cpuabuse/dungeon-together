/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe definitions
 */

import { PromiseQueue } from "../../common/async/promise-queue";
import {
	CoreArg,
	CoreArgContainer,
	CoreArgContainerArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionsPathOwnUnion
} from "../arg";
import { CoreBaseClassNonRecursive } from "../base";
import { CoreArgIndexableReader, CoreArgIndexer } from "../indexable";
import { CoreUniverseObjectArgsOptionsUnion } from "./options";
import { CoreUniverseObjectClass, CoreUniverseObjectInstance } from "./universe-object";
import { CoreUniverseObjectContainerInstance } from "./universe-objects-container";

/**
 * A universe constraint from perspective of universe object.
 *
 * @remarks
 * For class, this is to be treated like more of a constructor, an object that creates us universe objects, and does not have static type information.
 *
 * If we want to access it is a reader, or an indexer, cast it as such, if conditions are known.
 */
export type CoreUniverseObjectUniverse<
	BaseClass extends CoreBaseClassNonRecursive,
	Instance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildArg,
		ChildId
	>,
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
	// Cannot use class type, since constructor must return exactly provided generic
	[K in `${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: CoreUniverseObjectClass<
		BaseClass,
		Instance,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildArg,
		ChildId
	>;
} & ([ParentId] extends [never]
	? CoreUniverseObjectContainerInstance<BaseClass, Instance, Arg, Id, Options, ParentId, GrandparentIds>
	: CoreArgIndexableReader<Instance, Id, Options, ParentId | GrandparentIds> & {
			[K in keyof CoreArgIndexer<
				Instance,
				Id,
				Options,
				ParentId | GrandparentIds
			>]: Options extends CoreArgOptionsPathOwnUnion
				? CoreArgIndexer<Instance, Id, Options, ParentId | GrandparentIds>[K]
				: never;
	  }) & {
		/**
		 * Queue for universe.
		 */
		universeQueue: PromiseQueue;
	};
