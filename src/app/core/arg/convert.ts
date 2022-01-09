/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Shared functionality for converting core args
 */

import { Path, separator } from "../../common/path";
import {
	CoreArg,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionsUnion,
	CoreArgOptionsWithoutPathUnion,
	CoreArgWithoutPath
} from ".";

/**
 * Return type of {@link coreArgWithoutPathToCommonPath}.
 */
export type CoreArgMetaCommonPaths<N extends [CoreArgIds, ...CoreArgIds[]]> = {
	[K in keyof N]: {
		/**
		 * Path.
		 */
		path: Path;
	};
};

/**
 * Extracts path from ID-like.
 *
 * @param idLike - ID like from YAML
 * @param settings - Settings to be passed to parser
 * @param meta - Core metadata
 * @returns Path
 */
export function coreArgWithoutPathToCommonPath<
	N extends [CoreArgIds, ...CoreArgIds[]],
	M extends CoreArgMeta<CoreArgOptionsWithoutPathUnion, N>
>({
	arg,
	ids,
	meta
}: {
	/**
	 * Arg.
	 */
	arg: CoreArgWithoutPath;

	/**
	 * Ids.
	 */
	ids: N;

	/**
	 * Meta.
	 */
	meta: M;
}): CoreArgMetaCommonPaths<N> {
	if (ids.length <= 1) {
		/**
		 * Meta with single arg id.
		 */
		type BeforeRootMeta = M extends CoreArgMeta<infer O, N>
			? CoreArgMeta<O, N extends [infer I, ...CoreArgIds[]] ? [I] : never>
			: never;

		// `as unknown as R` is used, since we verified that return type is actually an array with single element
		return [
			{
				path:
					typeof arg.id === "undefined"
						? `${(meta as BeforeRootMeta).parentPath.id}${separator}${meta.index}`
						: `${meta.userPath}${separator}${arg.id}`
			}
		] as unknown as CoreArgMetaCommonPaths<N>;
	}

	/**
	 * Remove current ID.
	 */
	ids.pop();

	// To make a the return type of recursive call a usable tuple, for simplicity, arg types are cast to same as args of current iteration
	let parents: CoreArgMetaCommonPaths<N> = coreArgWithoutPathToCommonPath({
		arg: meta.parentPath,
		ids,
		meta: meta.parentMeta as M
	});

	return [
		// To make a the return type of recursive call a usable tuple, for simplicity, arg types are cast to same as args of current iteration
		{
			path:
				typeof arg.id === "undefined"
					? `${parents[0].path}${separator}${meta.index}`
					: `${meta.userPath}${separator}${arg.id}`
		},
		...parents
		// `as unknown as R` is used, since the resulting value has an extra element in the beginning, and the rest is the result of recursive call with one ID shifted
	] as unknown as CoreArgMetaCommonPaths<N>;
}
