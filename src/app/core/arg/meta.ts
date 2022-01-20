/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { UrlOrigin, UrlPath, separator } from "../../common/url";
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
 * @typeParam ChildId - ID of a child
 * @typeParam SourceOptions - Options for the source
 * @typeParam TargetOptions - Options for the target
 * @typeParam ParentIds - IDs for the parents; optional
 */
export type CoreArgMetaExists<
	ChildId extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = (SourceOptions extends CoreArgOptionsPathIdUnion
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
 * Destructured parameter for meta.
 *
 * @typeParam ChildId - ID of a child
 * @typeParam SourceOptions - Options for the source
 * @typeParam TargetOptions - Options for the target
 * @typeParam ParentIds - IDs for the parents; optional
 * @typeParam Key - Key of the meta in destructured parameter
 */
export type CoreArgMetaDestructuredParameter<
	ChildId extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never,
	Key extends string = "meta"
> =
	| unknown
	| (never extends CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentIds>
			? {
					[E in Key]?: never;
			  }
			: {
					[E in Key]: CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentIds>;
			  });

/**
 * Metadata for arg.
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
> = unknown extends CoreArgMetaExists<ChildId, SourceOptions, TargetOptions, ParentIds>
	? undefined
	: CoreArgMetaExists<ChildId, SourceOptions, TargetOptions, ParentIds>;

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

	/**
	 * Current id.
	 */
	parentArgId?: ParentId;

	/**
	 * Parent source arg.
	 */
	sourceParentArg?: ParentId extends never ? never : CoreArg<ParentId, SourceOptions, GrandparentIds>;
}): CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds> {
	// #region Id to own or extended
	if (sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]) {
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
		 * Arg in case the path is common.
		 */
		type ParentArgPathId = CoreArg<ParentId, CoreArgOptionsPathId, GrandparentIds>;

		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		let { paths, ...rest } = meta as ParentMetaPathIdToExtended;

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			paths: {
				...paths,
				...{
					[childArgId]:
						typeof (sourceParentArg as ParentArgPathId).id !== "undefined"
							? // `as CommonPath` removes the undefined from `id`
							  `${(meta as ParentMetaPathIdToExtended).userNamespace}${separator}${
									(sourceParentArg as ParentArgPathId).id as UrlPath
							  }`
							: `${
									typeof parentArgId === "undefined"
										? (meta as ParentMetaPathIdToExtended).systemNamespace
										: // Have to cast source arg id to `I`, since generic information is lost when optional or undefined
										  (meta as ParentMetaPathIdToExtended).paths[parentArgId]
							  }${separator}${index}`
				}
			}
		} as CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds>;
	}
	// #endregion

	// #region Own to extended
	if (
		sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own] &&
		targetOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
	) {
		// If no parent, return what is given
		if (typeof parentArgId === "undefined") {
			return { ...(meta as MetaWithPathOwnToExtended) } as CoreArgMeta<
				ChildId,
				SourceOptions,
				TargetOptions,
				ParentId | GrandparentIds
			>;
		}

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
		type ParentArgPathOwn = CoreArg<ParentId, CoreArgOptionsPathOwn, GrandparentIds>;

		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		const { parentArgPath, ...rest } = meta as MetaWithPathOwnToExtended;

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
		} as CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds>;
	}
	// #endregion

	// Return undefined in cases arf should be empty
	return undefined as CoreArgMeta<ChildId, SourceOptions, TargetOptions, ParentId | GrandparentIds>;
}
