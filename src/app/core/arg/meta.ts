/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { UrlOrigin, UrlPath, separator } from "../../common/url";
import { MaybeDefined } from "../../common/utility-types";
import { Vector } from "../../common/vector";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathExtendedUnion,
	CoreArgOptionsPathId,
	CoreArgOptionsPathIdUnion,
	CoreArgOptionsPathOwn,
	CoreArgOptionsPathOwnUnion,
	CoreArgOptionsUnion,
	CoreArgOptionsWithNavUnion,
	CoreArgOptionsWithoutVectorUnion,
	CoreArgPath,
	CoreArgPathOwnOrExtended,
	CoreArgPathReduced,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName
} from ".";

/**
 * Metadata for arg.
 *
 * @remarks
 *
 * Intersecting with `Record<string, never>` for future compatibility, enforces an object.
 * Strictly speaking ID to ID information is needed only when converting from array to array, but since ID conversions are not sensitive to time, information for all conversions from ID.
 *
 * @typeParam ChildId - ID of a child
 * @typeParam SourceOptions - Options for the source
 * @typeParam TargetOptions - Options for the target
 * @typeParam ParentIds - IDs for the parents; optional
 */
export type CoreArgMeta<
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = object &
	(SourceOptions extends CoreArgOptionsPathIdUnion
		? {
				/**
				 * URL paths.
				 *
				 * When extended contains parent paths.
				 */
				paths: {
					[K in Id | (TargetOptions extends CoreArgOptionsPathExtendedUnion ? ParentIds : never)]: UrlPath;
				};

				/**
				 * Base URL.
				 */
				origin: UrlOrigin;

				/**
				 * Namespace used for ID generated paths, when ID is defined.
				 */
				userNamespace: UrlPath;

				/**
				 * Namespace used for system generated paths, when ID is undefined.
				 */
				systemNamespace: UrlPath;
			}
		: unknown) &
	(SourceOptions extends CoreArgOptionsPathOwnUnion
		? TargetOptions extends CoreArgOptionsPathExtendedUnion
			? {
					/**
					 * Path of parent arg.
					 *
					 * Contains only parent information, of target options.
					 */
					parentArgPath: CoreArgPathOwnOrExtended<ParentIds>;
				}
			: unknown
		: unknown);

/**
 * Index for meta.
 */
export type CoreArgMetaNavPathIndex<
	Id extends CoreArgIds,
	Options extends CoreArgOptionsWithNavUnion,
	ParentIds extends CoreArgIds
> = {
	/**
	 * Nav index.
	 */
	nav: CoreArgPathReduced<Id, Options, ParentIds>[][][];
} & (Options extends CoreArgOptionsWithoutVectorUnion ? Vector : unknown);

/**
 * Extracts path from ID-like.
 *
 * @typeParam ChildId - ID of a child
 * @typeParam SourceOptions - Options for the source
 * @typeParam TargetOptions - Options for the target
 * @typeParam ParentId - ID of a parent
 * @typeParam GrandparentIds - IDs for grandparents; Cannot be set if `ParentId` is not set; Optional
 * @param param - Destructured parameter
 * @returns Path
 */
export function coreArgMetaGenerate<
	ChildId extends CoreArgIds,
	// Parent of `S`
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentId extends CoreArgIds,
	GrandparentIds extends CoreArgIds = never
>({
	parentId,
	id,
	parentArg,
	meta,
	sourceOptions,
	targetOptions,
	index,
	childPath
}: {
	/**
	 * Index of child.
	 */
	index: number;

	/**
	 * Next id.
	 */
	id: ChildId;

	/**
	 * Options.
	 */
	sourceOptions: SourceOptions;

	/**
	 * Options.
	 */
	targetOptions: TargetOptions;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<ParentId, SourceOptions, TargetOptions, GrandparentIds>;

	/**
	 * Child arg.
	 */
	childPath: CoreArgPath<ChildId, SourceOptions, ParentId | GrandparentIds>;
} & MaybeDefined<
	// In case `ParentId` is never, will be evaluated to `never` if not a tuple
	[ParentId] extends [never] ? false : true,
	{
		/**
		 * Current id.
		 *
		 * @remarks
		 * Used as discriminator.
		 */
		parentId: ParentId;

		/**
		 * Parent source arg.
		 */
		parentArg: CoreArg<ParentId, SourceOptions, GrandparentIds>;
	}
>): CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds> {
	/**
	 * Return type alias.
	 */
	type ReturnType = CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds>;

	/**
	 * Options in case the path is common.
	 *
	 * Generation is same for both extended and own, so using an extended type subset.
	 */
	type ParentMetaPathIdToExtended = CoreArgMeta<
		ParentId,
		CoreArgOptionsPathId,
		CoreArgOptionsPathExtended,
		GrandparentIds
	>;

	/**
	 * Options in case the path is common.
	 *
	 * Generation is same for both extended and own, so using an extended type subset.
	 */
	type ParentMetaWithPathOwnToExtended = CoreArgMeta<
		ParentId,
		CoreArgOptionsPathOwn,
		CoreArgOptionsPathExtended,
		GrandparentIds
	>;

	/**
	 * Arg for child, if ID.
	 */
	type ChildArgPathId = CoreArgPath<ChildId, CoreArgOptionsPathId, ParentId | GrandparentIds>;

	/**
	 * Arg in case the path is common.
	 */
	type ParentArgPathOwn = CoreArg<ParentId, CoreArgOptionsPathOwn, GrandparentIds>;

	// #region Id to own or extended
	if (sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]) {
		// Casting, since no overlaps
		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		let { paths, ...rest } = meta as ParentMetaPathIdToExtended;
		let path: string;

		if (typeof parentId === "undefined") {
			path = `${(meta as unknown as ParentMetaPathIdToExtended).systemNamespace}${separator}${index}`;
		} else if ((childPath as ChildArgPathId).id) {
			path = `${(meta as unknown as ParentMetaPathIdToExtended).userNamespace}${separator}${
				(childPath as ChildArgPathId).id as UrlPath
			}`;
		} else {
			path = `${paths[parentId]}${separator}${index}`;
		}

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			paths: {
				...paths,
				[id]: path
			}
			// Casting, since no overlaps with return type
		} as unknown as ReturnType;
	}
	// #endregion

	// #region Own to extended
	if (
		sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own] &&
		targetOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
	) {
		// If no parent, return what is given
		if (typeof parentId === "undefined") {
			// Casting, since no overlaps
			return { ...(meta as unknown as ParentMetaWithPathOwnToExtended) } as unknown as CoreArgMeta<
				ChildId,
				SourceOptions,
				TargetOptions,
				ParentId | GrandparentIds
			>;
		}

		// Casting, since no overlaps
		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		const { parentArgPath, ...rest } = meta as unknown as ParentMetaWithPathOwnToExtended;

		// UUID property name
		const parentArgUuidPropertyName: CoreArgPathUuidPropertyName<ParentId> = coreArgIdToPathUuidPropertyName({
			id: parentId
		});

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			parentArgPath: {
				...parentArgPath,
				...{ [parentArgUuidPropertyName]: (parentArg as ParentArgPathOwn)[parentArgUuidPropertyName] }
			}
			// Casting, since no overlaps with return type
		} as unknown as ReturnType;
	}
	// #endregion

	// Return same what received
	return { ...(meta as Record<string, unknown>) } as ReturnType;
}
