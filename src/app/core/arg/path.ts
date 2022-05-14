/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object paths
 */

import { MapIntersection } from "../../common/utility-types";
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

// BUG: Remove fix
/**
 * A type for the property name of path UUID.
 *
 * @remarks Unknown breaking change in TS 4.6, sometimes prevents union from being produced, when the parameter is generic union, so types mismatch. Explicit map produces string union consistently.
 */
export type CoreArgPathUuidPropertyName<I extends CoreArgIds> = {
	[K in I]: `${CoreArgObjectWords[K]["singularLowercaseWord"]}Uuid`;
}[I];

/**
 * Generates UUIDs in core arg.
 */
export type CoreArgPathOwnOrExtended<I extends CoreArgIds> = {
	[K in I as CoreArgPathUuidPropertyName<K>]: Uuid;
};

/**
 * Path.
 */
type Path<
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion,
	P extends CoreArgIds = never
> = (O extends CoreArgOptionsPathOwnOrExtendedUnion ? CoreArgPathOwnOrExtended<I> : unknown) &
	(O extends CoreArgOptionsPathExtendedUnion ? CoreArgPathOwnOrExtended<P> : unknown) &
	(O extends CoreArgOptionsPathIdUnion
		? {
				/**
				 * Id.
				 */
				id?: string;
		  }
		: unknown);

/**
 * Path but with always present properties, set to `never` if "missing".
 *
 * @remarks
 * Signature `K in CoreArgPathUuidPropertyName<I>` does not work well, probably due underlying generic mapped union.
 */
type PathWithNever<I extends CoreArgIds, O extends CoreArgOptionsUnion, P extends CoreArgIds = never> = {
	[K in I as CoreArgPathUuidPropertyName<K>]: O extends CoreArgOptionsPathOwnOrExtendedUnion ? string : never;
} & {
	[K in P as CoreArgPathUuidPropertyName<K>]: O extends CoreArgOptionsPathExtendedUnion ? string : never;
} & {
	/**
	 * Id.
	 */
	id?: O extends CoreArgOptionsPathIdUnion ? string : never;
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
	P extends CoreArgIds = never,
	HasNever extends boolean = false
> = MapIntersection<HasNever extends true ? PathWithNever<I, O, P> : Path<I, O, P>>;

/**
 * Generate a name for path property.
 *
 * @param param - Destructured parameter
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
