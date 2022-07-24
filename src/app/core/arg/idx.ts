/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Core arg index objects.
 *
 * @file
 */

import { Uuid } from "../../common/uuid";
import {
	CoreArgComplexOptionPathIds,
	CoreArgIds,
	CoreArgOptionIds,
	CoreArgOptionsPathId,
	CoreArgOptionsPathIdUnion,
	CoreArgOptionsPathOwn,
	CoreArgOptionsPathOwnOrExtendedUnion,
	CoreArgOptionsUnion,
	CoreArgPath,
	CoreArgPathReduced,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName
} from ".";

/**
 * Ids to construct index objects.
 *
 * @remarks
 * Cannot reference option IDs, for string enums.
 */
export enum CoreArgIndexIds {
	Kind = "kind",
	Mode = "mode",
	World = "world"
}

/**
 * Information if were to index path.
 */
export type CoreArgIndex<Options extends CoreArgOptionsUnion> = Options extends CoreArgOptionsPathIdUnion
	? string
	: Uuid;

/**
 * Makes a path like object, based on property name.
 *
 * @remarks
 * For generic type assignability, should be conditional object, not an object with conditional key.
 * To remove false positives, all conditions should be separate.
 * `object` added for spread.
 */
export type CoreArgIndexObject<
	Property extends CoreArgIndexIds,
	Options extends CoreArgOptionsUnion,
	R extends boolean = false
> = (Options extends CoreArgOptionsPathIdUnion
	? R extends true
		? {
				[K in `${Property}`]: CoreArgIndex<Options>;
		  }
		: {
				[K in `${Property}`]?: CoreArgIndex<Options>;
		  }
	: unknown) &
	(Options extends CoreArgOptionsPathOwnOrExtendedUnion
		? {
				[K in `${Property}Uuid`]: CoreArgIndex<Options>;
		  }
		: unknown);

/**
 * Gets path's index value from path.
 *
 * @param param - Destructured parameter
 * @returns Path index
 */
export function coreArgGetIndex<
	Id extends CoreArgIds,
	Options extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds
>({
	id,
	path,
	options
}: {
	/**
	 * Id.
	 */
	id: Id;

	/**
	 * Path.
	 */
	path: CoreArgPathReduced<Id, Options, ParentIds>;

	/**
	 * Options.
	 */
	options: Options;
}): CoreArgIndex<Options> | undefined {
	if (
		options[CoreArgOptionIds.Path] ===
		coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
	) {
		return (path as CoreArgPath<Id, CoreArgOptionsPathId, ParentIds>).id;
	}
	return (path as CoreArgPath<Id, CoreArgOptionsPathOwn, ParentIds>)[coreArgIdToPathUuidPropertyName({ id })];
}

/**
 * Gets {@link CoreArgIndexObject}'s property name.
 *
 * @param param - Destructured parameter
 * @returns Property name
 */
export function getCoreArgIndexObjectPropertyName<
	Property extends CoreArgIndexIds,
	Options extends CoreArgOptionsUnion
>({
	name,
	options
}: {
	/**
	 * Property name.
	 */
	name: Property;

	/**
	 * Options.
	 */
	options: Options;
}): keyof CoreArgIndexObject<Property, Options> {
	if (
		options[CoreArgOptionIds.Path] ===
		coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
	) {
		return name as unknown as keyof CoreArgIndexObject<Property, Options>;
	}
	return `${name}Uuid` as keyof CoreArgIndexObject<Property, Options>;
}
