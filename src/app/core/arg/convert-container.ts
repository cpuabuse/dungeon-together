/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Converts container
 */

import { Uuid, getDefaultUuid } from "../../common/uuid";
import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgContainerArg } from "./arg-container-arg";
import { CoreArgsContainer } from "./args-container";
import { CoreArgsWithMapContainerArg, CoreArgsWithoutMapContainerArg } from "./map";
import { CoreArgMeta, coreArgChildMetaGenerate } from "./meta";
import {
	CoreArgComplexOptionPathIds,
	CoreArgOptionIds,
	CoreArgOptionsUnion,
	coreArgComplexOptionSymbolIndex
} from "./options";
import { CoreArgOptionsPathId, CoreArgPathOwnOrExtended, coreArgIdToPathUuidPropertyName } from "./path";
import { CoreArgObjectWords, coreArgObjectWords } from "./words";

/**
 * Converter function type.
 */
export type CoreArgConverter<
	SourceArg extends CoreArg<Id, SourceOptions, ParentIds>,
	TargetArg extends CoreArg<Id, TargetOptions, ParentIds>,
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = (
	params: {
		/**
		 * Target source entity.
		 */
		[K in `${CoreArgObjectWords[Id]["singularLowercaseWord"]}`]: SourceArg;
	} & {
		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Target options.
		 */
		targetOptions: TargetOptions;

		/**
		 * Meta for entity.
		 */
		meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;
	}
) => TargetArg;

/**
 * Converts container.
 *
 * @remarks
 * This function cannot be typed well, so have to be very careful, when used. The container type checks some of the consistency for source, target and options.
 *
 * @param param - Destructured parameters
 * @returns Converted container
 */
export function coreArgContainerConvert<
	Arg extends CoreArgContainerArg<Id, SourceOptions, ParentIds, ChildId>,
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds,
	ChildArg extends CoreArg<ChildId, TargetOptions, Id | ParentIds>,
	ChildId extends CoreArgIds
>({
	id,
	childId,
	childConverter,
	meta,
	arg,
	sourceOptions,
	targetOptions
}: {
	/**
	 * Id.
	 */
	id: Id;

	/**
	 * Child ID.
	 */
	childId: ChildId;

	/**
	 * Converter function.
	 */
	childConverter: CoreArgConverter<
		Arg extends CoreArgsContainer<infer A, ChildId, SourceOptions, Id | ParentIds> ? A : never,
		ChildArg,
		ChildId,
		SourceOptions,
		TargetOptions,
		Id | ParentIds
	>;

	/**
	 * Meta.
	 */
	meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;

	/**
	 * Source arg.
	 */
	arg: Arg;

	/**
	 * Source options.
	 */
	sourceOptions: SourceOptions;

	/**
	 * Target options.
	 */
	targetOptions: TargetOptions;
}): CoreArgsContainer<ChildArg, ChildId, TargetOptions, Id | ParentIds> {
	/**
	 * Child args property name (in arg).
	 */
	type ChildArgsProperty = `${CoreArgObjectWords[ChildId]["pluralLowercaseWord"]}`;

	/**
	 * Source container property with map.
	 */
	type SourceWithMapArgs = CoreArgsWithMapContainerArg<
		Arg extends CoreArgsContainer<infer A, ChildId, SourceOptions, Id | ParentIds> ? A : never,
		ChildId,
		SourceOptions,
		Id | ParentIds
	>;

	/**
	 * Source container property without map.
	 */
	type SourceWithoutMapArgs = CoreArgsWithoutMapContainerArg<
		Arg extends CoreArgsContainer<infer A, ChildId, SourceOptions, Id | ParentIds> ? A : never,
		ChildId,
		SourceOptions,
		Id | ParentIds
	>;

	/**
	 * Target args property.
	 */
	type TargetArgs = CoreArgsContainer<ChildArg, ChildId, TargetOptions, Id | ParentIds>[ChildArgsProperty];

	/**
	 * Child meta when converting from ID.
	 */
	type ChildMetaPathId = CoreArgMeta<ChildId, CoreArgOptionsPathId, TargetOptions, Id | ParentIds>;

	/**
	 * Child own path.
	 */
	type ChildPathOwn = CoreArgPathOwnOrExtended<ChildId>;

	/**
	 * Convert child.
	 *
	 * @param param - Destructure parameter
	 * @returns Converted child
	 */
	function convertChild({
		child,
		index
	}: {
		/**
		 * Entity.
		 */
		child: Arg extends CoreArgsContainer<infer A, ChildId, SourceOptions, Id | ParentIds> ? A : never;

		/**
		 * Index.
		 */
		index: number;
	}): {
		/**
		 * Child arg.
		 */
		targetChild: ChildArg;

		/**
		 * Child meta.
		 */
		childMeta: CoreArgMeta<ChildId, SourceOptions, TargetOptions, Id | ParentIds>;
	} {
		let childMeta: CoreArgMeta<ChildId, SourceOptions, TargetOptions, Id | ParentIds> = coreArgChildMetaGenerate({
			childId,
			index,
			meta,
			parentArg: id,
			parentId: id,
			sourceOptions,
			targetOptions
			// Parent arg/Id are conditional in child meta, but we know they are here, so we have to cast; Result as whole loses generic types, so need to cast as well
		} as Parameters<typeof coreArgChildMetaGenerate>[0]) as CoreArgMeta<
			ChildId,
			SourceOptions,
			TargetOptions,
			Id | ParentIds
		>;

		return {
			childMeta,

			targetChild: childConverter({
				meta: childMeta,

				[nameArgParam]: child,

				// Cast to expected type
				sourceOptions,
				// Cast to expected type
				targetOptions
				// Have to cast, as cannot infer generic keys from child
			} as Parameters<CoreArgConverter<Arg extends CoreArgsContainer<infer A, ChildId, SourceOptions, Id | ParentIds> ? A : never, ChildArg, ChildId, SourceOptions, TargetOptions, Id | ParentIds>>[0])
		};
	}

	const nameArgParam: `${CoreArgObjectWords[ChildId]["singularLowercaseWord"]}` = `${coreArgObjectWords[childId].singularLowercaseWord}`;
	const childArgsProperty: ChildArgsProperty = `${coreArgObjectWords[childId].pluralLowercaseWord}`;
	const sourceArgs: Arg[ChildArgsProperty] = arg[childArgsProperty];
	let targetArgs: TargetArgs;

	// (sourceArgs as unknown as SourceContainerWithoutMapArgs).map((child, index) => [
	// 	(child as ChildArg)[coreArgIdToPathUuidPropertyName({ id: childId })],
	// 	// Cast arguments back to generic type, and result to expected type
	// 	convertChild({ child, index })
	// ]);

	// Map
	if (targetOptions[CoreArgOptionIds.Map] === true) {
		if (sourceOptions[CoreArgOptionIds.Map] === true) {
			// Casting counts as use before assigned, `!` assertion triggers ESLint
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
			targetArgs = new Map(
				// Argument types correctly inferred from "Array.from()", probably eslint bug
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(sourceArgs as unknown as SourceWithMapArgs, ([uuid, child], index) => [
					uuid,
					convertChild({ child, index }).targetChild
				])
			) as TargetArgs;
		} else {
			// Casting counts as use before assigned, `!` assertion triggers ESLint
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
			targetArgs = new Map(
				(sourceArgs as unknown as SourceWithoutMapArgs).map((child, index) => {
					let { targetChild, childMeta }: ReturnType<typeof convertChild> = convertChild({ child, index });

					let childUuid: Uuid;

					if (
						sourceOptions.path ===
							coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id] ||
						targetOptions.path ===
							coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Id]
					) {
						childUuid = getDefaultUuid({
							// Casting, since no overlaps
							origin: (childMeta as unknown as ChildMetaPathId).origin,
							// Casting, since no overlaps
							path: (childMeta as unknown as ChildMetaPathId).paths[childId]
						});
					} else {
						childUuid = (child as unknown as ChildPathOwn)[coreArgIdToPathUuidPropertyName({ id: childId })];
					}

					return [childUuid, targetChild];
				})
			) as TargetArgs;
		}
	} else if (sourceOptions[CoreArgOptionIds.Map] === true) {
		// Casting counts as use before assigned, `!` assertion triggers ESLint
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
		targetArgs = Array.from(
			sourceArgs as unknown as SourceWithMapArgs,
			// Argument types correctly inferred from "Array.from()", probably eslint bug, and UUID is unused
			// eslint-disable-next-line @typescript-eslint/typedef, @typescript-eslint/no-unused-vars
			([uuid, child], index) => convertChild({ child, index }).targetChild
		) as TargetArgs;
	} else {
		// Casting counts as use before assigned, `!` assertion triggers ESLint
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
		targetArgs = (sourceArgs as unknown as SourceWithoutMapArgs).map(
			(child, index) => convertChild({ child, index }).targetChild
		) as TargetArgs;
	}

	return {
		[childArgsProperty]: targetArgs
		// Cannot infer template key signature
	} as unknown as CoreArgsContainer<ChildArg, ChildId, TargetOptions, Id | ParentIds>;
}
