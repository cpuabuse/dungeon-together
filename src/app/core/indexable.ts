/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Arg indexer.
 *
 * @file
 */

import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgComplexOptionSymbolIndex,
	CoreArgContainer,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsUnionGenerate,
	CoreArgPath
} from "./arg";

/**
 * Args options constraint for core universe objects.
 */
export type CoreArgIndexableOptionsUnion = CoreArgOptionsUnionGenerate<
	CoreArgOptionIds.Map,
	never,
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own]
	| CoreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
>;

/**
 * Indexable arg.
 */
type CoreArgIndexable<
	Id extends CoreArgIds,
	Options extends CoreArgIndexableOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArg<Id, Options, ParentIds>;

/**
 * Get arg member of getter object.
 */
export type CoreArgIndexableReader<
	Indexable extends CoreArgIndexable<Id, Options, ParentIds>,
	Id extends CoreArgIds,
	Options extends CoreArgIndexableOptionsUnion,
	ParentIds extends CoreArgIds = never
> = {
	[K in `get${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
		path: CoreArgPath<Id, Options, ParentIds>
	) => Indexable;
};

/**
 * Arg indexer.
 */
export type CoreArgIndexer<
	Indexable extends CoreArgIndexable<Id, Options, ParentIds>,
	Id extends CoreArgIds,
	Options extends CoreArgIndexableOptionsUnion,
	ParentIds extends CoreArgIds = never
> = CoreArgContainer<Indexable, Id, Options, ParentIds> & {
	[K in `attach${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (arg: Indexable) => void;
} & {
	[K in `default${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: Indexable;
} & {
	[K in `detach${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
		path: CoreArgPath<Id, Options, ParentIds>
	) => void;
};
