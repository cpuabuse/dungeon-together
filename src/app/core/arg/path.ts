/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { Uuid } from "../../common/uuid";
import {
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsGenerate,
	CoreArgOptionsUnion,
	CoreArgOptionsUnionGenerate,
	coreArgObjectWords
} from ".";

/**
 * A type for the property name of path UUID.
 */
export type CoreArgPathUuidPropertyName<I extends CoreArgIds> = `${CoreArgObjectWords[I]["singularLowercaseWord"]}Uuid`;

/**
 * Generates UUIDs in core arg.
 */
export type CoreArgPathOwnOrExtended<I extends CoreArgIds> = {
	[K in CoreArgPathUuidPropertyName<I> as K]: Uuid;
};

/**
 * Universe object path constraint.
 */
export type CoreArgPathId = {
	/**
	 * Optional id of arg.
	 */
	id?: string;
};

/**
 * Path part of core arg.
 *
 * @remarks
 *
 * Is not an intersection for appropriate type inference.
 */
export type CoreArgPath<
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion,
	P extends CoreArgIds = never
> = O extends CoreArgOptionsPathIdUnion
	? CoreArgPathId
	: CoreArgPathOwnOrExtended<I | (O extends CoreArgOptionsPathExtendedUnion ? P : never)>;

/**
 * Generate a name for path property.
 *
 * @param param
 * @returns The name of the path property
 */
export function coreArgIdToPathUuidPropertyName<I extends CoreArgIds>({
	id: argId
}: {
	/**
	 * ID of the universe object.
	 */
	id: I;
}): CoreArgPathUuidPropertyName<I> {
	// Casting to remove union
	return `${coreArgObjectWords[argId].singularLowercaseWord}Uuid` as CoreArgPathUuidPropertyName<I>;
}

/**
 * Options with path.
 */
export type CoreArgOptionsPathOwn = CoreArgOptionsGenerate<
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
>;

/**
 * Options with path.
 */
export type CoreArgOptionsPathExtended = CoreArgOptionsGenerate<
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;

/**
 * Options with path.
 */
export type CoreArgOptionsPathId = CoreArgOptionsGenerate<
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
>;

/**
 * Core arg options with own path.
 */
export type CoreArgOptionsPathOwnUnion = CoreArgOptionsUnionGenerate<
	never,
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
>;

/**
 * Core arg options with extended path.
 */
export type CoreArgOptionsPathExtendedUnion = CoreArgOptionsUnionGenerate<
	never,
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsPathIdUnion = CoreArgOptionsUnionGenerate<
	never,
	never,
	CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
>;

/**
 * Core arg options with map.
 */
export type CoreArgOptionsPathOwnOrExtendedUnion = CoreArgOptionsUnionGenerate<
	never,
	never,
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;
