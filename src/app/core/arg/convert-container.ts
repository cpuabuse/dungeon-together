/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Converts container
 */

import { Uuid, getDefaultUuid } from "../../common/uuid";
import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgContainer } from "./container";
import { CoreArgConverter } from "./convert";
import { CoreArgsWithMapContainerArg, CoreArgsWithoutMapContainerArg } from "./map";
import { CoreArgMeta, coreArgMetaGenerate } from "./meta";
import {
	CoreArgComplexOptionPathIds,
	CoreArgOptionIds,
	CoreArgOptionsUnion,
	coreArgComplexOptionSymbolIndex
} from "./options";
import { CoreArgOptionsPathId, CoreArgPathOwnOrExtended, coreArgIdToPathUuidPropertyName } from "./path";
import { CoreArgObjectWords, coreArgObjectWords } from "./words";

/**
 * Maps container's args from source to target.
 *
 * @remarks
 * Mapped with reference to path.
 */
export type CoreArgConvertContainerLink<
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds,
	SourceArg extends CoreArg<Id, SourceOptions, ParentIds>,
	TargetArg extends CoreArg<Id, TargetOptions, ParentIds>
> = {
	/**
	 * Source to target.
	 */
	source: Map<SourceArg, TargetArg>;
	/**
	 * Target to source.
	 */
	target: Map<TargetArg, SourceArg>;
};

/**
 * Converts container.
 *
 * @remarks
 * This function cannot be typed well, so have to be very careful, when used. The container type checks some of the consistency for source, target and options.
 * Takes a converter function directly, since arg level functions are not aware of universe.
 *
 * @param param - Destructured parameters
 * @returns Converted container
 */
export function coreArgConvertContainer<
	SourceArg extends CoreArgContainer<SourceChildArg, ChildId, SourceOptions, Id | ParentIds>,
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds,
	SourceChildArg extends CoreArg<ChildId, SourceOptions, Id | ParentIds>,
	TargetChildArg extends CoreArg<ChildId, TargetOptions, Id | ParentIds>,
	ChildId extends CoreArgIds
>({
	id,
	childId,
	childConverter,
	meta,
	arg,
	sourceOptions,
	targetOptions,
	link
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
		SourceChildArg,
		TargetChildArg,
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
	arg: SourceArg;

	/**
	 * Source options.
	 */
	sourceOptions: SourceOptions;

	/**
	 * Target options.
	 */
	targetOptions: TargetOptions;

	/**
	 * To fill a linking object.
	 */
	link?: CoreArgConvertContainerLink<
		ChildId,
		SourceOptions,
		TargetOptions,
		Id | ParentIds,
		SourceChildArg,
		TargetChildArg
	>;
}): CoreArgContainer<TargetChildArg, ChildId, TargetOptions, Id | ParentIds> {
	/**
	 * Child args property name (in arg).
	 */
	type ChildArgsProperty = `${CoreArgObjectWords[ChildId]["pluralLowercaseWord"]}`;

	/**
	 * Source container property with map.
	 */
	type SourceWithMapArgs = CoreArgsWithMapContainerArg<SourceChildArg, ChildId, SourceOptions, Id | ParentIds>;

	/**
	 * Source container property without map.
	 */
	type SourceWithoutMapArgs = CoreArgsWithoutMapContainerArg<SourceChildArg, ChildId, SourceOptions, Id | ParentIds>;

	/**
	 * Target args property.
	 */
	type TargetArgs = CoreArgContainer<TargetChildArg, ChildId, TargetOptions, Id | ParentIds>[ChildArgsProperty];

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
		child: SourceChildArg;

		/**
		 * Index.
		 */
		index: number;
	}): {
		/**
		 * Child arg.
		 */
		targetChild: TargetChildArg;

		/**
		 * Child meta.
		 */
		childMeta: CoreArgMeta<ChildId, SourceOptions, TargetOptions, Id | ParentIds>;
	} {
		let childMeta: CoreArgMeta<ChildId, SourceOptions, TargetOptions, Id | ParentIds> = coreArgMetaGenerate({
			childPath: child,
			id: childId,
			index,
			meta,
			parentArg: arg,
			parentId: id,
			sourceOptions,
			targetOptions
			// Parent arg/Id are conditional in child meta, but we know they are here, so we have to cast; Result as whole loses generic types, so need to cast as well
		} as Parameters<typeof coreArgMetaGenerate>[0]) as CoreArgMeta<
			ChildId,
			SourceOptions,
			TargetOptions,
			Id | ParentIds
		>;

		let targetChild: TargetChildArg = childConverter({
			meta: childMeta,

			[nameArgParam]: child,

			// Cast to expected type
			sourceOptions,
			// Cast to expected type
			targetOptions
			// Have to cast, as cannot infer generic keys from child
		} as Parameters<
			CoreArgConverter<SourceChildArg, TargetChildArg, ChildId, SourceOptions, TargetOptions, Id | ParentIds>
		>[0]);

		if (link !== undefined) {
			link.source.set(child, targetChild);
			link.target.set(targetChild, child);
		}

		return {
			childMeta,
			targetChild
		};
	}

	const nameArgParam: `${CoreArgObjectWords[ChildId]["singularLowercaseWord"]}` = `${coreArgObjectWords[childId].singularLowercaseWord}`;
	const childArgsProperty: ChildArgsProperty = `${coreArgObjectWords[childId].pluralLowercaseWord}`;
	const sourceArgs: SourceArg[ChildArgsProperty] = arg[childArgsProperty];
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
	} as unknown as CoreArgContainer<TargetChildArg, ChildId, TargetOptions, Id | ParentIds>;
}
