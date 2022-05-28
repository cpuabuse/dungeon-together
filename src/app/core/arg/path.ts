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
 * Path.
 *
 * @remarks
 * In TS 4.6, with more changes in 4.7, when ID or parent IDs are generic, partial path members are not inferred.
 */
type Path<I extends CoreArgIds, O extends CoreArgOptionsUnion, P extends CoreArgIds = never> = object &
	(O extends CoreArgOptionsPathOwnOrExtendedUnion ? CoreArgPathOwnOrExtended<I> : unknown) &
	(O extends CoreArgOptionsPathExtendedUnion ? CoreArgPathOwnOrExtended<I | P> : unknown) &
	(O extends CoreArgOptionsPathIdUnion
		? {
				/**
				 * Id.
				 */
				id?: string;
		  }
		: unknown);

/**
 * Path with all possible members.
 */
type PathFull<I extends CoreArgIds, P extends CoreArgIds = never> = CoreArgPathOwnOrExtended<I> &
	CoreArgPathOwnOrExtended<I | P> & {
		/**
		 * Id.
		 */
		id?: string;
	};

/**
 * Path, with all keys statically known, but absent ones are set to never.
 *
 * @remarks
 * Constructed by intersecting {@link PathFull}, with never types. That makes this type extend normal path, which is a partial of full path.
 */
type PathNever<I extends CoreArgIds, O extends CoreArgOptionsUnion, P extends CoreArgIds = never> = PathFull<I, P> & {
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
 */
export type CoreArgPath<
	I extends CoreArgIds,
	O extends CoreArgOptionsUnion,
	P extends CoreArgIds = never,
	HasNever extends boolean = false
> = MapIntersection<HasNever extends true ? PathNever<I, O, P> : Path<I, O, P>>;

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
