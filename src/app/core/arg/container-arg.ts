/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Args containing args
 */

import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgContainer } from "./container";
import { CoreArgOptionsUnion } from "./options";

/**
 * Arg containing arg.
 */
export type CoreArgContainerArg<
	Id extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentIds> = never,
	ChildId extends CoreArgIds = never
> = CoreArg<Id, Options, ParentIds> & CoreArgContainer<ChildArg, ChildId, Options, Id | ParentIds>;
