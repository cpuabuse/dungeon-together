/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe object common definitions
 */

import {
	ComputedClassEmptyObject,
	ComputedClassOmitConditionalEmptyObject,
	ComputedClassWords
} from "../../common/computed-class";

import { ConcreteConstructor } from "../../common/utility-types";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgContainer,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgPath,
	CoreArgPathReduced,
	CoreArgPathUuidPropertyName,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveParameters } from "../base";
import { CoreArgIndexableReader, CoreArgIndexer } from "../indexable";
import { CoreUniverseObjectConstructorParameters, CoreUniverseObjectInstance } from "./universe-object";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectUniverse } from ".";

/**
 * Instance type.
 *
 * @remarks
 * Without it, cannot reference `this` easily in generic members.
 * Implementing this type, ensures that members are implemented correctly.
 *
 * Cannot use `InstanceType<BaseClass>`, since cannot implement in class (implies dynamic members), even if it would be extended.
 */
export type CoreUniverseObjectContainerInstance<
	BaseParams extends CoreBaseNonRecursiveParameters,
	// We do not care what class is base class for child
	Instance extends CoreUniverseObjectInstance<BaseParams, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassOmitConditionalEmptyObject<
	// Includes container
	CoreArgIndexer<Instance, Id, Options, ParentId | GrandparentIds> &
		// Argument will be reduced path in implementation
		CoreArgIndexableReader<Instance, Id, Options, ParentId | GrandparentIds> & {
			// Necessary to implement where the created child is known, to call attach
			[K in `add${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				...childArgs: CoreUniverseObjectConstructorParameters<BaseParams, Arg, Id, Options, ParentId | GrandparentIds>
			) => Instance;
		} & {
			[K in `remove${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
			) => void;
		}
>;

/**
 * Static type.
 *
 * @remarks
 * Without it, cannot reference `this` easily in generic members.
 * Implementing this type, ensures that members are implemented correctly.
 */
export type CoreUniverseObjectContainerStatic<
	BaseParams extends CoreBaseNonRecursiveParameters,
	// We do not care what class is base class for child
	// Preserve for future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Instance extends CoreUniverseObjectInstance<BaseParams, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassOmitConditionalEmptyObject<ComputedClassEmptyObject>;

/**
 * Class type.
 */
export type CoreUniverseObjectContainerClass<
	BaseParams extends CoreBaseNonRecursiveParameters,
	Container extends CoreUniverseObjectContainerInstance<
		BaseParams,
		Instance,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds
	>,
	Instance extends CoreUniverseObjectInstance<BaseParams, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ConstructorParams extends any[] = any[]
> = CoreUniverseObjectContainerStatic<BaseParams, Instance, Arg, Id, Options, ParentId, GrandparentIds> &
	ConcreteConstructor<ConstructorParams, Container>;

/**
 * Universe object container members.
 *
 * @typeParam BaseClass - Base class to extend from
 * @typeParam Instance - Universe object to contain
 * @typeParam Id - ID of the universe object
 * @typeParam Options - Options for the universe object
 * @param param - Destructured parameters
 * @returns Members object
 */
// Infer return type for extraction
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function generateCoreUniverseObjectContainerMembers<
	BaseParams extends CoreBaseNonRecursiveParameters,
	// We do not care what class is base class for child
	Instance extends CoreUniverseObjectInstance<BaseParams, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
>({
	id,
	// Keep for future consistency
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	options
}: {
	/**
	 * Universe object ID.
	 */
	id: Id;

	/**
	 * Args options.
	 */
	options: Options;
}) {
	/**
	 * This instance.
	 */
	type ThisInstance = CoreUniverseObjectContainerInstance<
		BaseParams,
		Instance,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds
	>;

	/**
	 * Universe for child.
	 */
	type Universe = CoreUniverseObjectUniverse<BaseParams, Instance, Arg, Id, Options, ParentId | GrandparentIds>;

	// Base words
	const {
		pluralLowercaseWord,
		singularCapitalizedWord
	}: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[Id]["singularCapitalizedWord"];
	} = coreArgObjectWords[id];

	// Need to extract types
	/* eslint-disable @typescript-eslint/typedef */
	const nameGetUniverseObject = `get${singularCapitalizedWord}` as const; // Name of get universe object function
	const nameRemoveUniverseObject = `remove${singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjects = `${pluralLowercaseWord}` as const; // Name of universe objects member
	const nameDefaultUniverseObject = `default${singularCapitalizedWord}` as const; // Name of default universe object
	const nameDetachUniverseObject = `detach${singularCapitalizedWord}` as const; // Name of detach universe object function
	const nameTerminateUniverseObject = `terminate${singularCapitalizedWord}` as const; // Name of remove universe object function
	/* eslint-enable @typescript-eslint/typedef */
	const pathUuidPropertyName: CoreArgPathUuidPropertyName<Id> = coreArgIdToPathUuidPropertyName({
		id
	}); // UUID property name within a path
	const isOwnPath: boolean =
		options[CoreArgOptionIds.Path] ===
		coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Own];

	/**
	 * Members of class.
	 *
	 * @remarks
	 *
	 * - There are implicit constraints of how the const should be structured, but will implicitly be type checked during usage
	 * - Cannot use abstract as `this`, as it will mismatch when `super` is called
	 * - Add and attach functions are not implemented here, as they depend on container type
	 */
	// Inference required for type check
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		[ComputedClassWords.Instance]: {
			[ComputedClassWords.Assign]: {
				detachUniverseObject: {
					[ComputedClassWords.Name]: nameDetachUniverseObject,

					/**
					 * Detaches child universe object.
					 *
					 * @param this - This instance
					 * @param path - Child universe object
					 */
					[ComputedClassWords.Value](
						this: ThisInstance,
						path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
					): void {
						this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
					}
				},

				getUniverseObject: {
					[ComputedClassWords.Name]: nameGetUniverseObject,
					/**
					 * Get universe object.
					 *
					 * @remarks
					 * To be overridden by universe.
					 *
					 * @param this - Universe object container
					 * @param path - Path to search for
					 * @returns Universe object
					 */
					[ComputedClassWords.Value](
						this: ThisInstance,
						path: CoreArgPathReduced<Id, Options, ParentId | GrandparentIds>
					): Instance {
						let universeObject: Instance | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);
						return universeObject === undefined ? this[nameDefaultUniverseObject] : universeObject;
					}
				},

				removeUniverseObject: {
					[ComputedClassWords.Name]: nameRemoveUniverseObject,
					/**
					 * Removes the child object.
					 *
					 * @remarks
					 * Did not split by `isOwnPath`, since function is complicated.
					 *
					 * @param this - Universe object container
					 * @param path - Path to search for
					 */
					[ComputedClassWords.Value](
						this: ThisInstance,
						path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
					): void {
						let universeObject: Instance | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);

						// Detach from universe
						if (isOwnPath) {
							// Deal with universe
							((this.constructor as CoreBaseClassNonRecursive).universe as Universe)[nameUniverseObjects].delete(
								path[pathUuidPropertyName]
							);
						}

						// Detach
						this[nameDetachUniverseObject](path);

						// Terminate if we can
						if (universeObject !== undefined) {
							(
								(universeObject.constructor as CoreBaseClassNonRecursive).universe as CoreUniverseObjectUniverse<
									BaseParams,
									Instance,
									Arg,
									Id,
									Options,
									ParentId,
									GrandparentIds
								>
							).universeQueue.addCallback({
								/**
								 * Callback.
								 */
								callback: () => {
									// False negative, as undefined check above
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									universeObject![nameTerminateUniverseObject]();
								}
							});
						}
					}
				}
			},

			[ComputedClassWords.Generate]: {
				universeObjects: {
					[ComputedClassWords.Name]: nameUniverseObjects,
					/**
					 * Function generating a new map of universe objects.
					 *
					 * @remarks
					 * To be extended by universe.
					 *
					 * @param this - Universe object container
					 * @param args - Args provided by
					 * @returns Map of universe objects
					 */
					[ComputedClassWords.Value](): CoreArgContainer<
						Instance,
						Id,
						Options,
						ParentId | GrandparentIds
					>[`${CoreArgObjectWords[Id]["pluralLowercaseWord"]}`] {
						return (options[CoreArgOptionIds.Map] ? new Map() : new Array()) as CoreArgContainer<
							Instance,
							Id,
							Options,
							ParentId | GrandparentIds
						>[`${CoreArgObjectWords[Id]["pluralLowercaseWord"]}`];
					}
				}
			}
		}
	};

	return members;
}
