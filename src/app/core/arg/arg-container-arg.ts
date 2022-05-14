/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Args containing args
 */

import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgsContainer } from "./args-container";
import { CoreArgOptionsUnion } from "./options";

/**
 * Arg containing arg.
 */
export type CoreArgContainerArg<
	Id extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never,
	ChildId extends CoreArgIds = never,
	HasNever extends boolean = false
> = CoreArg<Id, Options, ParentIds, HasNever> &
	CoreArgsContainer<CoreArg<ChildId, Options, Id | ParentIds>, ChildId, Options, Id | ParentIds>;
