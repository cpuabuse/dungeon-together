/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { UrlOrigin, UrlPath, separator } from "../../common/url";
import { MaybeDefined } from "../../common/utility-types";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgOptionIds,
	CoreArgOptionsExtendedUnion,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathId,
	CoreArgOptionsPathIdUnion,
	CoreArgOptionsPathOwn,
	CoreArgOptionsPathOwnUnion,
	CoreArgOptionsUnion,
	CoreArgPathOwnOrExtended,
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
 *
 * @typeParam ChildId - ID of a child
 * @typeParam SourceOptions - Options for the source
 * @typeParam TargetOptions - Options for the target
 * @typeParam ParentIds - IDs for the parents; optional
 */
export type CoreArgMeta<
	ChildId extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = Record<string, never> &
	(SourceOptions extends CoreArgOptionsPathIdUnion
		? TargetOptions extends CoreArgOptionsPathOwnUnion | CoreArgOptionsExtendedUnion
			? {
					/**
					 * URL paths.
					 *
					 * When extended contains parent paths.
					 */
					paths: {
						[K in ChildId | (TargetOptions extends CoreArgOptionsExtendedUnion ? ParentIds : never)]: UrlPath;
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
			: unknown
		: unknown) &
	(SourceOptions extends CoreArgOptionsPathOwnUnion
		? TargetOptions extends CoreArgOptionsExtendedUnion
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
export function coreArgChildMetaGenerate<
	ChildId extends CoreArgIds,
	// Parent of `S`
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentId extends CoreArgIds,
	GrandparentIds extends CoreArgIds = never
>({
	parentArgId,
	childArgId,
	sourceParentArg,
	meta,
	sourceOptions,
	targetOptions,
	index
}: {
	/**
	 * Index of child.
	 */
	index: number;

	/**
	 * Next id.
	 */
	childArgId: ChildId;

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
	// In case `ParentId` is never, will be evaluated to `never` if not a tuple
} & MaybeDefined<
	[ParentId] extends [never] ? false : true,
	{
		/**
		 * Current id.
		 *
		 * @remarks
		 * Used as discriminator.
		 */
		parentArgId: ParentId;

		/**
		 * Parent source arg.
		 */
		sourceParentArg: CoreArg<ParentId, SourceOptions, GrandparentIds>;
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
	type MetaWithPathOwnToExtended = CoreArgMeta<
		ParentId,
		CoreArgOptionsPathOwn,
		CoreArgOptionsPathExtended,
		GrandparentIds
	>;

	/**
	 * Arg in case the path is common.
	 */
	type ParentArgPathId = CoreArg<ParentId, CoreArgOptionsPathId, GrandparentIds>;

	/**
	 * Arg in case the path is common.
	 */
	type ParentArgPathOwn = CoreArg<ParentId, CoreArgOptionsPathOwn, GrandparentIds>;

	// #region Id to own or extended
	if (sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]) {
		// Casting, since no overlaps
		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		let { paths, ...rest } = meta as unknown as ParentMetaPathIdToExtended;
		let path: string;

		if (typeof parentArgId === "undefined") {
			path = `${(meta as unknown as ParentMetaPathIdToExtended).systemNamespace}${separator}${index}`;
		} else if (typeof (sourceParentArg as ParentArgPathId).id === "undefined") {
			path = `${paths[parentArgId]}${separator}${index}`;
		} else {
			path = `${(meta as unknown as ParentMetaPathIdToExtended).userNamespace}${separator}${
				(sourceParentArg as ParentArgPathId).id as UrlPath
			}`;
		}

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			paths: {
				...paths,
				[childArgId]: path
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
		if (typeof parentArgId === "undefined") {
			// Casting, since no overlaps
			return { ...(meta as unknown as MetaWithPathOwnToExtended) } as unknown as CoreArgMeta<
				ChildId,
				SourceOptions,
				TargetOptions,
				ParentId | GrandparentIds
			>;
		}

		// Casting, since no overlaps
		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		const { parentArgPath, ...rest } = meta as unknown as MetaWithPathOwnToExtended;

		// UUID property name
		const parentArgUuidPropertyName: CoreArgPathUuidPropertyName<ChildId> = coreArgIdToPathUuidPropertyName({
			id: parentArgId
		});

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			paths: {
				...parentArgPath,
				...{ [parentArgUuidPropertyName]: (sourceParentArg as ParentArgPathOwn)[parentArgUuidPropertyName] }
			}
			// Casting, since no overlaps with return type
		} as unknown as ReturnType;
	}
	// #endregion

	// Return same what received
	return { ...(meta as Record<string, unknown>) } as ReturnType;
}
