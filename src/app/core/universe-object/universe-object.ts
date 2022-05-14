/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { DeferredPromise } from "../../common/async";
import { ComputedClassWords, EmptyObject, computedClassDeepMerge } from "../../common/computed-class";
import { urlPathSeparator } from "../../common/defaults";
import { ConditionalObject, MaybeDefined, StaticMembers } from "../../common/utility-types";
import { Uuid, getDefaultUuid } from "../../common/uuid";
import {
	CoreArg,
	CoreArgComplexOptionPathIds,
	CoreArgContainerArg,
	CoreArgIds,
	CoreArgObjectWords,
	CoreArgOptionIds,
	CoreArgOptionsPathExtended,
	CoreArgOptionsPathOwn,
	CoreArgPath,
	CoreArgPathUuidPropertyName,
	CoreArgsContainer,
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveInstance } from "../base";
import { CoreUniverseObjectInitializationParameter } from "./parameters";
import { CoreUniverseObjectContainerInstance, CoreUniverseObjectContainerStatic } from "./universe-objects-container";
import { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectUniverse } from ".";

/**
 * Parameters for universe object.
 */
export type CoreUniverseObjectConstructorParameters<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArg<Id, Options, ParentIds>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentIds extends CoreArgIds = never
> = [Arg, CoreUniverseObjectInitializationParameter, ConstructorParameters<BaseClass>];

/**
 * Universe object instance members type.
 *
 * @remarks
 * Constraint is not dependent on the base, due to the fact that the non-recursive core base used, should not be a generic {@link CoreBaseClassNonRecursive}.
 */
export type CoreUniverseObjectInstance<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildId extends CoreArgIds = never
> = CoreArgPath<Id, Options, ParentId | GrandparentIds, true> & {
	[K in `terminate${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: () => void;
} & ([ParentId] extends [never]
		? EmptyObject
		: {
				[K in `move${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (
					path: CoreArgPath<ParentId, Options, GrandparentIds>
				) => void;
		  }) &
	([ChildId] extends [never]
		? // Receives base class from container
		  CoreBaseNonRecursiveInstance
		: CoreUniverseObjectContainerInstance<
				BaseClass,
				ChildInstance,
				Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
				ChildId,
				Options,
				Id,
				ParentId | GrandparentIds
		  >);

/**
 * Static part of universe object class.
 */
export type CoreUniverseObjectStatic<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildId extends CoreArgIds = never
> = {
	[K in `getDefault${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}Uuid`]: (
		path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
	) => Uuid;
} & ([ChildId] extends [never]
	? unknown
	: CoreUniverseObjectContainerStatic<
			BaseClass,
			ChildInstance,
			Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
			ChildId,
			Options,
			Id,
			ParentId | GrandparentIds
	  > & {
			[K in `getDefault${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}Uuid`]: (
				path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
			) => Uuid;
	  });

/**
 * Generate object members.
 *
 * @param param - Destructured parameter
 * @returns Universe object members
 */
// Infer return type for extraction
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function generateCoreUniverseObjectMembers<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildId extends CoreArgIds = never
>({
	id,
	options,
	childId,
	parentId,
	grandparentIds
}: {
	/**
	 * Universe object ID.
	 */
	id: Id;

	/**
	 * Arg index.
	 *
	 * Set must contain all elements of type `GrandparentIds`.
	 */
	grandparentIds: Set<GrandparentIds>;

	/**
	 * Args options.
	 */
	options: Options;
} & MaybeDefined<
	[ChildId] extends [never] ? false : true,
	{
		/**
		 * Whether this is a container or not.
		 */
		childId: ChildId;
	}
> &
	MaybeDefined<
		[ParentId] extends [never] ? false : true,
		{
			/**
			 * Optional parent ID.
			 */
			parentId: ParentId;
		}
	>) {
	/**
	 * This instance.
	 */
	type Instance = CoreUniverseObjectInstance<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildId
	>;

	/**
	 * Instance, when container.
	 */
	type InstanceWithChild = CoreUniverseObjectContainerInstance<
		BaseClass,
		ChildInstance,
		Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	>;

	/**
	 * Static.
	 */
	type Static = StaticMembers<BaseClass> &
		CoreUniverseObjectStatic<BaseClass, Arg, Id, Options, ParentId, GrandparentIds, ChildInstance, ChildId>;

	/**
	 * Parameters for generate functions.
	 */
	type GenerateParams = [
		{
			/**
			 * Arg path.
			 */
			arg: Arg;
		}
	];

	/**
	 * Parameters for class constructor.
	 */
	type ConstructorParams = CoreUniverseObjectConstructorParameters<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId | GrandparentIds
	>;

	/**
	 * Members, when child present (container).
	 */
	type MembersWithChild = ConditionalObject<typeof membersWithChildData, [ChildId] extends [never] ? false : true>;

	/**
	 * Members, when child present (container).
	 */
	type MembersWithParent = ConditionalObject<typeof membersWithParentData, [ParentId] extends [never] ? false : true>;

	/**
	 * Part of members object responsible for extended path.
	 *
	 * @remarks
	 * This type must produce all properties unconditionally, for it's result to be able to be merged with resulting class.
	 */
	type PathMembers = {
		[K in keyof CoreArgPath<Id, Options, ParentId | GrandparentIds, true> as `universeObjectUuidExtended${K}`]: {
			/**
			 * Extended path UUID property name.
			 */
			name: K;

			/**
			 * Extended path UUID value.
			 */
			value: (...arg: GenerateParams) => CoreArgPath<Id, Options, ParentId | GrandparentIds, true>[K];
		};
	};

	// Inferring for final type
	const words: {
		/**
		 * The plural lowercase word for the universe object.
		 */
		pluralLowercaseWord: CoreArgObjectWords[Id]["pluralLowercaseWord"];

		/**
		 * The singular capitalized word for the universe object.
		 */
		singularCapitalizedWord: CoreArgObjectWords[Id]["singularCapitalizedWord"];
	} = coreArgObjectWords[id];

	/* eslint-disable @typescript-eslint/typedef */
	const nameTerminateUniverseObject = `terminate${words.singularCapitalizedWord}` as const; // Name of remove universe object function
	const nameUniverseObjectUuid = coreArgIdToPathUuidPropertyName({ id }); // Name of universe object UUID
	const nameMoveUniverseObject = `move${words.singularCapitalizedWord}` as const; // Name of move universe object function
	const universeObjectsUuidPath = `pluralLowercaseWord` as const; // Name of universe object UUID
	/* eslint-enable @typescript-eslint/typedef */

	// Extract child members type
	/* eslint-disable @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type */
	const membersWithChildData =
		childId === undefined
			? {
					isPresent: false as const,

					value: {
						[ComputedClassWords.Instance]: {
							[ComputedClassWords.Assign]: {
								terminateUniverseObject: {
									name: nameTerminateUniverseObject,
									/**
									 * Terminate universe object function.
									 *
									 * @param this - This instance
									 */
									value(this: Instance): void {
										// Nothing, debug info can be added later
									}
								}
							}
						}
					}
			  }
			: {
					isPresent: true as const,

					value: (() => {
						// Words to be used for child, if not child, then null
						const childWords: {
							/**
							 * The plural lowercase word for the universe object.
							 */
							pluralLowercaseWord: CoreArgObjectWords[ChildId]["pluralLowercaseWord"];

							/**
							 * The singular capitalized word for the universe object.
							 */
							singularCapitalizedWord: CoreArgObjectWords[ChildId]["singularCapitalizedWord"];
						} = coreArgObjectWords[childId];
						const nameTerminateChildUniverseObject = `terminate${childWords.singularCapitalizedWord}` as const; // Name of remove universe object function, if child is present, otherwise null
						const nameStaticGetDefaultChildUniverseObjectUuid =
							`getDefault${childWords.singularCapitalizedWord}Uuid` as const; // Name of universe object UUID
						const nameChildUniverseObjects = `${childWords.pluralLowercaseWord}` as const; // Name of universe objects member
						const nameAttachChildUniverseObjects = `attach${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
						const nameAddChildUniverseObject = `add${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
						const nameChildUniverseObjectClass = `${childWords.singularCapitalizedWord}` as const; // Name of child class

						return {
							[ComputedClassWords.Instance]: {
								[ComputedClassWords.Assign]: {
									addChildUniverseObject: {
										name: nameAddChildUniverseObject,

										// ESLint buggy
										// eslint-disable-next-line jsdoc/require-param
										/**
										 * @param this - Instance of container
										 */
										value(
											this: Instance,
											childArgs: CoreUniverseObjectConstructorParameters<
												BaseClass,
												Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds>
													? A
													: never,
												ChildId,
												Options,
												Id | ParentId | GrandparentIds
											>
										): void {
											// ESLint buggy for nested destructured params
											// eslint-disable-next-line @typescript-eslint/typedef
											let [, { attachHook, created }]: CoreUniverseObjectConstructorParameters<
												BaseClass,
												Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds>
													? A
													: never,
												ChildId,
												Options,
												Id | ParentId | GrandparentIds
											> = childArgs;
											setTimeout(() => {
												let child: ChildInstance = new (
													this.universe as CoreUniverseObjectUniverse<
														BaseClass,
														ChildInstance,
														Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds>
															? A
															: never,
														ChildId,
														Options,
														Id | ParentId | GrandparentIds
													>
												)[nameChildUniverseObjectClass](...childArgs);

												// Attach
												this[nameAttachChildUniverseObjects](child, { attachHook });

												// Call hook
												created.resolve();
											});
										}
									},

									terminateUniverseObject: {
										name: nameTerminateUniverseObject,

										/**
										 * Terminates children of universe object.
										 *
										 * @param this - Core universe object instance
										 */
										value(this: Instance): void {
											(this as InstanceWithChild)[nameChildUniverseObjects].forEach(universeObject => {
												universeObject[nameTerminateChildUniverseObject]();
											});
										}
									}
								}
							},

							// Static
							[ComputedClassWords.Static]: {
								[ComputedClassWords.Assign]: {
									getDefaultUniverseObjectUuid: {
										name: nameStaticGetDefaultChildUniverseObjectUuid,

										/**
										 * Get default universe object UUID.
										 *
										 * @param this - Type of class
										 * @param path - Universe object own path
										 * @returns Default universe object UUID
										 */
										value(this: Static, path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>): Uuid {
											return getDefaultUuid({
												path: `${universeObjectsUuidPath}${urlPathSeparator}${path[nameUniverseObjectUuid]}`
											});
										}
									}
								}
							}
						};
					})()
			  };

	const membersWithParentData =
		parentId === undefined
			? {
					isPresent: false as const,
					value: {
						[ComputedClassWords.Instance]: {
							[ComputedClassWords.Assign]: {}
						}
					}
			  }
			: {
					isPresent: true as const,
					value: (() => {
						/**
						 * Parent's instance.
						 *
						 * @remarks
						 * Parent's parent information missing, as it is not known or required.
						 */
						type ParentInstance = CoreUniverseObjectInstance<
							BaseClass,
							CoreArgContainerArg<ParentId, Options, never, Id>,
							ParentId,
							Options,
							never,
							never,
							Instance,
							Id
						>;

						// Inferring for final type
						const parentWords: {
							/**
							 * The plural lowercase word for the universe object.
							 */
							pluralLowercaseWord: CoreArgObjectWords[ParentId]["pluralLowercaseWord"];

							/**
							 * The singular capitalized word for the universe object.
							 */
							singularCapitalizedWord: CoreArgObjectWords[ParentId]["singularCapitalizedWord"];
						} = coreArgObjectWords[parentId];

						const nameAttachUniverseObject = `attach${words.singularCapitalizedWord}` as const; // Name of remove universe object function
						const nameGetParentUniverseObject = `get${parentWords.singularCapitalizedWord}` as const; // Name of remove universe object function

						return {
							[ComputedClassWords.Instance]: {
								[ComputedClassWords.Assign]: {
									moveUniverseObject: {
										name: nameMoveUniverseObject,

										/**
										 * Moves universe object to a different parent.
										 *
										 * @param this - Destructured `this`
										 * @param path - Parent path
										 */
										value(this: Instance, path: CoreArgPath<ParentId, Options, GrandparentIds>): void {
											// Locate cells
											// Does not overlap, casting
											let parentUniverseObject: ParentInstance = (
												this.universe as CoreUniverseObjectUniverse<
													BaseClass,
													ParentInstance,
													CoreArg<ParentId, Options>,
													ParentId,
													Options
												>
											)[nameGetParentUniverseObject](path);

											// Reattach
											parentUniverseObject[nameAttachUniverseObject](this);
										}
									}
								}
							}
						};
					})()
			  };
	/* eslint-enable @typescript-eslint/typedef, @typescript-eslint/explicit-function-return-type */

	const membersWithChild: MembersWithChild = membersWithChildData.value as MembersWithChild;
	const membersWithParent: MembersWithParent = membersWithParentData.value as MembersWithParent;

	return {
		...computedClassDeepMerge({
			membersArray: [
				membersWithChild,
				membersWithParent,
				{
					[ComputedClassWords.Instance]: {
						[ComputedClassWords.Generate]: {
							// Extended injection
							...([
								id,
								...(options.path ===
								coreArgComplexOptionSymbolIndex[CoreArgOptionIds.Path][CoreArgComplexOptionPathIds.Extended]
									? [...(parentId === undefined ? [] : [parentId]), ...grandparentIds]
									: [])
							].reduce((result, i) => {
								let uuidPropertyName: CoreArgPathUuidPropertyName<typeof i> = coreArgIdToPathUuidPropertyName({
									id: i
								});
								return {
									...result,
									[`universeObjectUuidExtended${i}`]: {
										[ComputedClassWords.Name]: uuidPropertyName,

										// ESLint buggy
										// eslint-disable-next-line jsdoc/require-param
										/**
										 * Extended path UUID.
										 *
										 * @param arg - Arg from constructor
										 * @returns UUID of grandparent universe object
										 */
										// ESLint nested destructured bug
										// eslint-disable-next-line @typescript-eslint/typedef
										[ComputedClassWords.Value]: (...[{ arg }]: GenerateParams): Uuid => {
											return (arg as CoreArgPath<Id, CoreArgOptionsPathExtended, ParentId | GrandparentIds>)[
												uuidPropertyName
											];
										}
									}
								};
							}, {}) as PathMembers)
						}
					}
				}
			]
		}),

		// ESLint buggy on destructured params
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 */
		// Infer type
		// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
		[ComputedClassWords.Constructor](
			that: Instance,
			// ESLint destructured param bug
			// eslint-disable-next-line @typescript-eslint/typedef
			[arg, { created, attachHook }, superParams]: ConstructorParams
		) {
			if (typeof childId === "undefined") {
				created.resolve();
			} else {
				const nameChildUniverseObjects: `${CoreArgObjectWords[ChildId]["pluralLowercaseWord"]}` = `${coreArgObjectWords[childId].pluralLowercaseWord}`;
				const nameAddChildUniverseObject: `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}` =
					`add${coreArgObjectWords[childId].singularCapitalizedWord}` as const; // Name of universe objects member

				Promise.all(
					Array.from(
						// Cast to keep generic info
						arg[nameChildUniverseObjects].values() as IterableIterator<
							Arg extends CoreArgsContainer<infer A, ChildId, Options, Id | ParentId | GrandparentIds> ? A : never
						>
					).map(childArg => {
						let childCreatedPromise: DeferredPromise<void> = new DeferredPromise<void>();

						(that as InstanceWithChild)[nameAddChildUniverseObject]([
							childArg,
							{ attachHook, created: childCreatedPromise },
							superParams
						]);

						return childCreatedPromise;
					})
				)
					.then(() => {
						// Finally resolve this creation
						created.resolve();
					})
					.catch(() => {
						// Pass error handling upstairs
						created.reject();
					});
			}
		}
	};
}
