/*
	Copyright 2022 cpuabuse.com
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

import {
	CoreArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	CoreArgsContainer,
	CoreArgsWithMapContainerArg,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveInstance } from "../base";
import { CoreUniverseObjectInitializationParameter } from "./parameters";
import { CoreUniverseObjectConstructorParameters, CoreUniverseObjectInstance } from "./universe-object";
import { CoreUniverseObjectArgsOptionsUnion } from ".";

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
	BaseClass extends CoreBaseClassNonRecursive,
	// We do not care what class is base class for child
	Instance extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassOmitConditionalEmptyObject<
	CoreBaseNonRecursiveInstance &
		CoreArgsContainer<Instance, Id, Options, ParentId | GrandparentIds> & {
			[K in `get${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
			) => Instance;
		} & {
			[K in `remove${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
			) => void;
		} & {
			[K in `attach${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				universeObject: Instance,
				initializationParameter: Pick<CoreUniverseObjectInitializationParameter, "attachHook">
			) => void;
		} & {
			[K in `detach${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
			) => boolean;
		} & {
			[K in `default${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: Instance;
		} & {
			// Necessary to implement where the created child is known, to call attach
			[K in `add${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
				childArgs: CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>
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
	BaseClass extends CoreBaseClassNonRecursive,
	// We do not care what class is base class for child
	// Preserve for future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Instance extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
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
	BaseClass extends CoreBaseClassNonRecursive,
	// We do not care what class is base class for child
	// Preserve for future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Instance extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
	Arg extends CoreArg<Id, Options, ParentId | GrandparentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never
> = ComputedClassOmitConditionalEmptyObject<ComputedClassEmptyObject>;

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
	BaseClass extends CoreBaseClassNonRecursive,
	// We do not care what class is base class for child
	Instance extends CoreUniverseObjectInstance<BaseClass, Arg, Id, Options, ParentId, GrandparentIds>,
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
		BaseClass,
		Instance,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds
	>;

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
	const nameAttachUniverseObject = `attach${singularCapitalizedWord}` as const; // Name of attach universe object function
	const nameDetachUniverseObject = `detach${singularCapitalizedWord}` as const; // Name of detach universe object function
	const nameAbstractDefaultUniverseObject = `default${singularCapitalizedWord}` as const; // Name of default universe object
	/* eslint-enable @typescript-eslint/typedef */
	const pathUuidPropertyName: CoreArgPathUuidPropertyName<Id> = coreArgIdToPathUuidPropertyName({
		id
	}); // UUID property name within a path

	/**
	 * Members of class.
	 *
	 * @remarks
	 *
	 * - There are implicit constraints of how the const should be structured, but will implicitly be type checked during usage
	 * - Cannot use abstract as `this`, as it will mismatch when `super` is called
	 */
	// Inference required for type check
	// eslint-disable-next-line @typescript-eslint/typedef
	const members = {
		[ComputedClassWords.Instance]: {
			[ComputedClassWords.Assign]: {
				attachChildUniverseObject: {
					[ComputedClassWords.Name]: nameAttachUniverseObject,

					/**
					 * Attaches child universe object.
					 *
					 * @param this - This instance
					 * @param universeObject - Child universe object
					 * @param initializationParameter - Initialization parameter
					 */
					[ComputedClassWords.Value](
						this: ThisInstance,
						universeObject: Instance,
						// Keep for type consistency
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						initializationParameter: Pick<CoreUniverseObjectInitializationParameter, "attachHook">
					): void {
						this[nameUniverseObjects].set(universeObject[pathUuidPropertyName], universeObject);
					}
				},

				detachChildUniverseObject: {
					[ComputedClassWords.Name]: nameDetachUniverseObject,

					/**
					 * Detaches child universe object.
					 *
					 * @param this - This instance
					 * @param path - Child universe object
					 * @returns True if detached, false if not
					 */
					[ComputedClassWords.Value](
						this: ThisInstance,
						path: CoreArgPath<Id, Options, ParentId | GrandparentIds>
					): boolean {
						return this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
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
					[ComputedClassWords.Value](this: ThisInstance, path: CoreArg<Id, Options>): Instance {
						let universeObject: Instance | undefined = this[nameUniverseObjects].get(path[pathUuidPropertyName]);
						return universeObject === undefined ? this[nameAbstractDefaultUniverseObject] : universeObject;
					}
				},
				removeUniverseObject: {
					[ComputedClassWords.Name]: nameRemoveUniverseObject,
					/**
					 * Removes the child object.
					 *
					 * @remarks
					 * To be added by universe.
					 *
					 * @param this - Universe object container
					 * @param path - Path to search for
					 */
					[ComputedClassWords.Value](this: ThisInstance, path: CoreArgPath<Id, Options>): void {
						this[nameUniverseObjects].delete(path[pathUuidPropertyName]);
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
					[ComputedClassWords.Value](): CoreArgsWithMapContainerArg<Instance, Id, Options> {
						return new Map();
					}
				}
			}
		}
	};

	return members;
}
