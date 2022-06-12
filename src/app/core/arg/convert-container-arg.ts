/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Converts container arg.
 */

import { MaybeDefined } from "../../common/utility-types";
import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgContainerArg } from "./container-arg";
import { CoreArgConverter } from "./convert";
import { coreArgConvert } from "./convert-arg";
import { CoreArgConvertContainerLink, coreArgConvertContainer } from "./convert-container";
import { CoreArgMeta } from "./meta";
import { CoreArgOptionsUnion } from "./options";

/**
 * Converts arg that is container.
 *
 * @param param - Destructured parameters
 * @returns Converted container
 */
export function coreArgConvertContainerArg<
	SourceArg extends CoreArgContainerArg<Id, SourceOptions, ParentIds, SourceChildArg, ChildId>,
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds,
	SourceChildArg extends CoreArg<ChildId, SourceOptions, Id | ParentIds>,
	TargetChildArg extends CoreArg<ChildId, TargetOptions, Id | ParentIds>,
	ChildId extends CoreArgIds
>({
	parentIds,
	id,
	childId,
	childConverter,
	meta,
	arg,
	sourceOptions,
	targetOptions,
	link
}: {
	/**
	 * Id.
	 */
	id: Id;

	/**
	 * Converter function.
	 */
	childConverter: CoreArgConverter<
		SourceChildArg,
		TargetChildArg,
		ChildId,
		SourceOptions,
		TargetOptions,
		Id | ParentIds
	>;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;

	/**
	 * Source arg.
	 */
	arg: SourceArg;

	/**
	 * Source options.
	 */
	sourceOptions: SourceOptions;

	/**
	 * Target options.
	 */
	targetOptions: TargetOptions;

	/**
	 * Child ID.
	 */
	childId: ChildId;

	/**
	 * To fill a linking object.
	 */
	link?: CoreArgConvertContainerLink<
		ChildId,
		SourceOptions,
		TargetOptions,
		Id | ParentIds,
		SourceChildArg,
		TargetChildArg
	>;
} & MaybeDefined<
	[ParentIds] extends [never] ? false : true,
	{
		/**
		 * Optional parent IDs.
		 */
		parentIds: Set<ParentIds>;
	}
>): CoreArgContainerArg<Id, TargetOptions, ParentIds, TargetChildArg, ChildId> {
	return {
		...coreArgConvert({
			arg,
			id,
			meta,
			parentIds,
			sourceOptions,
			targetOptions
			// Have to cast, since `parentIds` us conditional generic
		} as Parameters<typeof coreArgConvert>[0]),
		...coreArgConvertContainer({
			arg,
			childConverter,
			childId,
			id,
			link,
			meta,
			sourceOptions,
			targetOptions
		})
	} as CoreArgContainerArg<Id, TargetOptions, ParentIds, TargetChildArg, ChildId>;
}
