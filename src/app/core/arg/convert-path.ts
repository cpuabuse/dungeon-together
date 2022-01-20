/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Path conversion.
 */

import { getDefaultUuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgMeta,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathId,
	CoreArgOptionsPathOwn,
	CoreArgOptionsUnion,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName
} from ".";

/**
 * Populates path for conversion.
 *
 * @example Creating parent arg IDs
 * ```typescript
 * const argIds = [CoreArgIds.Shard] as const;
 * const parameters = { parentArgIds: new Set(argIds) };
 * // ...
 * coreArgConvertPopulatePath(options);
 * ```
 *
 * @param param - Destructured parameter
 * @returns The populated path
 */
// The exhaustiveness of the switch is not picked up by eslint
// eslint-disable-next-line consistent-return
export function coreArgConvertPopulatePath<
	I extends CoreArgIds,
	P extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion,
	M extends CoreArgMeta<I, S, T, P>
>({
	childArgId,
	sourceChildArg,
	parentArgIds,
	sourceOptions,
	targetOptions,
	meta
}: {
	/**
	 * Target arg ID.
	 */
	childArgId: I;

	/**
	 * Arg index.
	 *
	 * Set must contain all elements of type `P`.
	 */
	parentArgIds: Set<P>;

	/**
	 * Core cell args.
	 */
	sourceChildArg: CoreArg<I, S, P>;

	/**
	 * Option for the source.
	 */
	sourceOptions: S;

	/**
	 * Option for the target.
	 */
	targetOptions: T;

	/**
	 * Meta for conversion.
	 */
	meta?: M;
}): CoreArgPath<I, T, P> {
	/**
	 * Arg with path when common.
	 */
	type ChildArgPathId = CoreArg<I, CoreArgOptionsPathId, P>;

	/**
	 * Arg with path when own.
	 */
	type ChildArgPathOwn = CoreArg<I, CoreArgOptionsPathOwn, P>;

	/**
	 * Arg with path when own.
	 */
	type ChildArgPathExtended = CoreArg<I, CoreArgOptionsPathOwn, P>;

	/**
	 * Options in case the path is common.
	 */
	type MetaPathIdToOwn = CoreArgMeta<I, CoreArgOptionsPathId, CoreArgOptionsPathOwn, P>;

	/**
	 * Options in case the path is common.
	 */
	type MetaPathIdToExtended = CoreArgMeta<I, CoreArgOptionsPathId, CoreArgOptionsPathExtended, P>;

	/**
	 * Options in case the path is common.
	 */
	type MetaPathOwnToExtended = CoreArgMeta<I, CoreArgOptionsPathOwn, CoreArgOptionsPathExtended, P>;

	// Switch is exhaustive and verified by TS via return type
	switch (sourceOptions[CoreArgOptionIds.Path]) {
		case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
			switch (targetOptions[CoreArgOptionIds.Path]) {
				// ID to ID
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
					return { id: (sourceChildArg as ChildArgPathId).id } as CoreArgPath<I, T, P>;

				// ID to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]:
					return {
						[coreArgIdToPathUuidPropertyName({ id: childArgId })]: getDefaultUuid({
							origin: (meta as MetaPathIdToOwn).origin,
							path: (meta as MetaPathIdToOwn).paths[childArgId]
						})
					} as CoreArgPath<I, T, P>;

				// ID to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
					return [childArgId, ...parentArgIds].reduce(
						(result, id) => ({
							...result,
							[coreArgIdToPathUuidPropertyName({ id })]: getDefaultUuid({
								origin: (meta as MetaPathIdToExtended).origin,
								path: (meta as MetaPathIdToExtended).paths[id]
							})
						}),
						{} as ChildArgPathExtended
					);

				// No default
			}

		// Fall through
		case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]:
			switch (targetOptions[CoreArgOptionIds.Path]) {
				// Own to ID
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
					return {
						id: (sourceChildArg as ChildArgPathOwn)[coreArgIdToPathUuidPropertyName({ id: childArgId })]
					} as CoreArgPath<I, T, P>;

				// Own to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id: childArgId });
					return {
						[uuidPropertyName]: (sourceChildArg as ChildArgPathOwn)[uuidPropertyName]
					} as CoreArgPath<I, T, P>;
				}

				// Own to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id: childArgId });
					return {
						...(meta as MetaPathOwnToExtended).parentArgPath,
						[uuidPropertyName]: (sourceChildArg as ChildArgPathOwn)[uuidPropertyName]
					};
				}

				// No default
			}

		// Fall through
		case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
			switch (targetOptions[CoreArgOptionIds.Path]) {
				// Extended to ID
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
					return {
						id: (sourceChildArg as ChildArgPathExtended)[coreArgIdToPathUuidPropertyName({ id: childArgId })]
					} as CoreArgPath<I, T, P>;

				// Extended to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id: childArgId });
					return {
						[uuidPropertyName]: (sourceChildArg as ChildArgPathExtended)[uuidPropertyName]
					} as CoreArgPath<I, T, P>;
				}

				// Extended to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
					return [childArgId, ...parentArgIds].reduce((result, id) => {
						const uuidPropertyName: CoreArgPathUuidPropertyName<typeof id> = coreArgIdToPathUuidPropertyName({
							id
						});
						return { ...result, [uuidPropertyName]: (sourceChildArg as ChildArgPathExtended)[uuidPropertyName] };
					}, {} as ChildArgPathExtended);

				// No default
			}

		// No default
	}

	// No return
}
