/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Path conversion.
 */

import { hasOwnProperty } from "../../common/utility-types";
import { getDefaultUuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	// Type used only for documentation
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	CoreArgConvertDoc,
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
 * Since arg is an intersection of different parts, this function works on one part of it - the path, and returns the path object, which should be independent of other parts, just dependent on options. The result of path conversion, should not change the values of other parts.
 *
 * @example Creating parent arg IDs
 * ```typescript
 * const argIds = [CoreArgIds.Shard] as const;
 * const parameters = { parentArgIds: new Set(argIds) };
 * // ...
 * coreArgConvertPopulatePath(options);
 * ```
 *
 * @see {@link CoreArgConvertDoc} for principles of conversion functions
 * @param param - Destructured parameter
 * @returns The populated path
 */
// The exhaustiveness of the switch is not picked up by eslint
// eslint-disable-next-line consistent-return
export function coreArgPathConvert<
	I extends CoreArgIds,
	S extends CoreArgOptionsUnion,
	T extends CoreArgOptionsUnion,
	P extends CoreArgIds
>({
	id,
	sourceArgPath,
	parentIds,
	sourceOptions,
	targetOptions,
	meta
}: {
	/**
	 * Target arg ID.
	 */
	id: I;

	/**
	 * Arg index.
	 *
	 * Set must contain all elements of type `P`.
	 */
	parentIds: Set<P>;

	/**
	 * Core cell args.
	 */
	sourceArgPath: CoreArgPath<I, S, P>;

	/**
	 * Option for the source.
	 */
	sourceOptions: S;

	/**
	 * Option for the target.
	 */
	targetOptions: T;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<I, S, T, P>;
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
	type ChildArgPathExtended = CoreArg<I, CoreArgOptionsPathExtended, P>;

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
					return (
						hasOwnProperty(sourceArgPath as ChildArgPathId, "id") ? { id: (sourceArgPath as ChildArgPathId).id } : {}
					) as CoreArgPath<I, T, P>;

				// ID to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]:
					return {
						[coreArgIdToPathUuidPropertyName({ id })]: getDefaultUuid({
							// Casting, since no overlaps
							origin: (meta as unknown as MetaPathIdToOwn).origin,
							// Casting, since no overlaps
							path: (meta as unknown as MetaPathIdToOwn).paths[id]
						})
					} as CoreArgPath<I, T, P>;

				// ID to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
					return [id, ...parentIds].reduce(
						(result, extendedId) => ({
							...result,
							[coreArgIdToPathUuidPropertyName({ id: extendedId })]: getDefaultUuid({
								// Casting, since no overlaps
								origin: (meta as unknown as MetaPathIdToExtended).origin,
								// Casting, since no overlaps
								path: (meta as unknown as MetaPathIdToExtended).paths[extendedId]
							})
						}),
						{} as ChildArgPathExtended
					) as CoreArgPath<I, T, P>;

				// No default
			}

		// Fall through
		case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]:
			switch (targetOptions[CoreArgOptionIds.Path]) {
				// Own to ID
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
					return {
						id: (sourceArgPath as ChildArgPathOwn)[coreArgIdToPathUuidPropertyName({ id })]
					} as CoreArgPath<I, T, P>;

				// Own to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id });
					return {
						[uuidPropertyName]: (sourceArgPath as ChildArgPathOwn)[uuidPropertyName]
					} as CoreArgPath<I, T, P>;
				}

				// Own to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id });
					return {
						// Casting, since no overlaps
						...(meta as unknown as MetaPathOwnToExtended).parentArgPath,
						[uuidPropertyName]: (sourceArgPath as ChildArgPathOwn)[uuidPropertyName]
					} as CoreArgPath<I, T, P>;
				}

				// No default
			}

		// Fall through
		case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
			switch (targetOptions[CoreArgOptionIds.Path]) {
				// Extended to ID
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]:
					return {
						id: (sourceArgPath as ChildArgPathExtended)[coreArgIdToPathUuidPropertyName({ id })]
					} as CoreArgPath<I, T, P>;

				// Extended to own
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]: {
					const uuidPropertyName: CoreArgPathUuidPropertyName<I> = coreArgIdToPathUuidPropertyName({ id });
					return {
						[uuidPropertyName]: (sourceArgPath as ChildArgPathExtended)[uuidPropertyName]
					} as CoreArgPath<I, T, P>;
				}

				// Extended to extended
				case coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]:
					return [id, ...parentIds].reduce((result, extendedId) => {
						const uuidPropertyName: CoreArgPathUuidPropertyName<typeof extendedId> = coreArgIdToPathUuidPropertyName({
							id: extendedId
						});
						return {
							...result,
							[uuidPropertyName]: (sourceArgPath as ChildArgPathExtended)[uuidPropertyName]
						};
					}, {} as ChildArgPathExtended) as CoreArgPath<I, T, P>;

				// No default
			}

		// No default
	}

	// No return
}
