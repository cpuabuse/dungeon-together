/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Data for options
 */

import { UrlOrigin, UrlPath } from "../../common/url";
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
 */
export type CoreArgMetaExists<
	I extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion,
	P extends CoreArgIds = never
> = (S extends CoreArgOptionsPathIdUnion
	? T extends CoreArgOptionsPathOwnUnion | CoreArgOptionsExtendedUnion
		? {
				/**
				 * URL paths.
				 *
				 * When extended contains parent paths.
				 */
				paths: {
					[K in I | (T extends CoreArgOptionsExtendedUnion ? P : never)]: UrlPath;
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
	(S extends CoreArgOptionsPathOwnUnion
		? T extends CoreArgOptionsExtendedUnion
			? {
					/**
					 * Path of parent arg.
					 *
					 * Contains only parent information, of target options.
					 */
					parentArgPath: CoreArgPathOwnOrExtended<P>;
			  }
			: unknown
		: unknown);

/**
 * Destructured parameter for meta.
 */
export type CoreArgMetaDestructuredParameter<
	I extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion,
	P extends CoreArgIds = never,
	K extends string = "meta"
> =
	| unknown
	| (never extends CoreArgMeta<I, S, T, P>
			? {
					[E in K]?: never;
			  }
			: {
					[E in K]: CoreArgMeta<I, S, T, P>;
			  });

/**
 * Metadata for arg.
 */
export type CoreArgMeta<
	I extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion,
	P extends CoreArgIds = never
> = unknown extends CoreArgMetaExists<I, S, T, P> ? undefined : CoreArgMetaExists<I, S, T, P>;

/**
 * Extracts path from ID-like.
 *
 * @returns Path
 */
export function coreArgChildMetaGenerate<
	I extends CoreArgIds,
	D extends CoreArgIds,
	// Parent of `S`
	P extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion
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
	childArgId: D;

	/**
	 * Options.
	 */
	sourceOptions: S;

	/**
	 * Options.
	 */
	targetOptions: T;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<I, S, T, P>;

	/**
	 * Current id.
	 */
	parentArgId?: I;

	/**
	 * Parent source arg.
	 */
	sourceParentArg?: I extends never ? never : CoreArg<I, S, P>;
}): CoreArgMeta<D, S, T, I | P> {
	// #region Id to own or extended
	if (sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]) {
		/**
		 * Options in case the path is common.
		 *
		 * Generation is same for both extended and own, so using an extended type subset.
		 */
		type ParentMetaPathIdToExtended = CoreArgMeta<I, CoreArgOptionsPathId, CoreArgOptionsPathExtended, P>;

		/**
		 * Arg in case the path is common.
		 */
		type ParentArgPathId = CoreArg<I, CoreArgOptionsPathId, P>;

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
		} as CoreArgMeta<D, S, T, I | P>;
	}
	// #endregion

	// #region Own to extended
	if (
		sourceOptions.path === coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own] &&
		targetOptions.path ===
			coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended] &&
		typeof parentArgId !== "undefined"
	) {
		/**
		 * Options in case the path is common.
		 *
		 * Generation is same for both extended and own, so using an extended type subset.
		 */
		type MetaWithPathOwnToExtended = CoreArgMeta<I, CoreArgOptionsPathOwn, CoreArgOptionsPathExtended, P>;

		/**
		 * Arg in case the path is common.
		 */
		type ParentArgPathOwn = CoreArg<I, CoreArgOptionsPathOwn, P>;

		// Infer for simplicity
		// eslint-disable-next-line @typescript-eslint/typedef
		const { parentArgPath, ...rest } = meta as MetaWithPathOwnToExtended;

		// UUID property name
		const parentArgUuidPropertyName: CoreArgPathUuidPropertyName<D> = coreArgIdToPathUuidPropertyName({
			id: parentArgId
		});

		// New meta; `paths` is an object, but it is destructured, thus the original meta data is not modified
		return {
			...rest,
			paths: {
				...parentArgPath,
				...{ [parentArgUuidPropertyName]: (sourceParentArg as ParentArgPathOwn)[parentArgUuidPropertyName] }
			}
		} as CoreArgMeta<D, S, T, I | P>;
	}
	// #endregion

	// Return undefined in cases arf should be empty
	return undefined as CoreArgMeta<D, S, T, I | P>;
}
