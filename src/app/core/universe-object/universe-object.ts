/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Outlines how universe object should like
 */

import { DeferredPromise } from "../../common/async";
import {
	ComputedClassEmptyObject,
	ComputedClassOmitConditionalEmptyObject,
	ComputedClassWords,
	computedClassDeepMerge
} from "../../common/computed-class";
import { urlPathSeparator } from "../../common/defaults";
import { ConcreteConstructor, ConditionalObject, MaybeDefined } from "../../common/utility-types";
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
	coreArgComplexOptionSymbolIndex,
	coreArgIdToPathUuidPropertyName,
	coreArgObjectWords
} from "../arg";
import { CoreBaseClassNonRecursive, CoreBaseNonRecursiveInstance, CoreBaseNonRecursiveStatic } from "../base";
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
> = [arg: Arg, init: CoreUniverseObjectInitializationParameter, baseParams: ConstructorParameters<BaseClass>];

/**
 * Universe object instance members type.
 *
 * @remarks
 * Using `this.constructor` to access static base information.
 *
 * Constraint is not dependent on the base, due to the fact that the non-recursive core base used, should not be a generic {@link CoreBaseClassNonRecursive}.
 */
export type CoreUniverseObjectInstance<
	BaseClass extends CoreBaseClassNonRecursive,
	// Future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildArg, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = ComputedClassOmitConditionalEmptyObject<
	CoreArg<Id, Options, ParentId | GrandparentIds, true> & {
		[K in `terminate${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: () => void;
	} & ([ParentId] extends [never]
			? ComputedClassEmptyObject
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
					ChildArg,
					ChildId,
					Options,
					Id,
					ParentId | GrandparentIds
			  >)
>;

/**
 * Static part of universe object class.
 */
export type CoreUniverseObjectStatic<
	BaseClass extends CoreBaseClassNonRecursive,
	// Future
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildArg, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
	// Unlike instance, container does not extend base class
> = ComputedClassOmitConditionalEmptyObject<
	CoreBaseNonRecursiveStatic & {
		// Generic dependent on options, so just any function
		[K in `convert${CoreArgObjectWords[Id]["singularCapitalizedWord"]}`]: (...args: any[]) => unknown;
	} & {
		[K in `getDefault${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}Uuid`]: (
			path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
		) => Uuid;
	} & ([ChildId] extends [never]
			? ComputedClassEmptyObject
			: CoreUniverseObjectContainerStatic<
					BaseClass,
					ChildInstance,
					ChildArg,
					ChildId,
					Options,
					Id,
					ParentId | GrandparentIds
			  > & {
					[K in `getDefault${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}Uuid`]: (
						path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>
					) => Uuid;
			  })
>;

/**
 * Universe object class.
 */
export type CoreUniverseObjectClass<
	BaseClass extends CoreBaseClassNonRecursive,
	Instance extends CoreUniverseObjectInstance<
		BaseClass,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildArg,
		ChildId
	>,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildArg, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
	ChildId extends CoreArgIds = never
> = CoreUniverseObjectStatic<BaseClass, Arg, Id, Options, ParentId, GrandparentIds, ChildInstance, ChildArg, ChildId> &
	ConcreteConstructor<
		CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>,
		Instance
	>;

/**
 * Generate object members.
 *
 * @remarks
 * Add child universe object function not implemented, as it requires id-determined arg information.
 *
 * @param param - Destructured parameter
 * @returns Universe object members
 */
// Infer return type for extraction
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function generateCoreUniverseObjectMembers<
	BaseClass extends CoreBaseClassNonRecursive,
	Arg extends CoreArgContainerArg<Id, Options, ParentId | GrandparentIds, ChildArg, ChildId>,
	Id extends CoreArgIds,
	Options extends CoreUniverseObjectArgsOptionsUnion,
	ParentId extends CoreArgIds = never,
	GrandparentIds extends CoreArgIds = never,
	ChildInstance extends CoreUniverseObjectInstance<
		BaseClass,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	> = never,
	ChildArg extends CoreArg<ChildId, Options, Id | ParentId | GrandparentIds> = never,
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

			/**
			 * Arg index.
			 *
			 * Set must contain all elements of type `GrandparentIds`.
			 */
			grandparentIds: Set<GrandparentIds>;
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
		ChildArg,
		ChildId
	>;

	/**
	 * Instance, when container.
	 */
	type InstanceWithChild = CoreUniverseObjectContainerInstance<
		BaseClass,
		ChildInstance,
		ChildArg,
		ChildId,
		Options,
		Id,
		ParentId | GrandparentIds
	>;

	/**
	 * Static.
	 */
	type Class = CoreUniverseObjectClass<
		BaseClass,
		Instance,
		Arg,
		Id,
		Options,
		ParentId,
		GrandparentIds,
		ChildInstance,
		ChildArg,
		ChildId
	>;

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
	type ConstructorParams = [
		that: Instance,
		ctorParams: CoreUniverseObjectConstructorParameters<BaseClass, Arg, Id, Options, ParentId | GrandparentIds>,
		...defaultChildArg: [ChildId] extends [never] ? [] : [ChildArg]
	];

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
										 * @remarks
										 * If called from within a constructor, will call attach of potential subclass, as it is within async.
										 *
										 * Firstly attach happens, then child creation. As default grandchild will be created synchronously, it should be created with default child(grandchild's relative parent) already present.
										 *
										 * @param this - Instance of container
										 * @returns Child instance
										 */
										// Promise used for delay
										// eslint-disable-next-line @typescript-eslint/require-await
										value(
											this: Instance,
											childArgs: CoreUniverseObjectConstructorParameters<
												BaseClass,
												ChildArg,
												ChildId,
												Options,
												Id | ParentId | GrandparentIds
											>
										): ChildInstance {
											// ESLint buggy for nested destructured params
											// eslint-disable-next-line @typescript-eslint/typedef
											let [, { attachHook }]: CoreUniverseObjectConstructorParameters<
												BaseClass,
												ChildArg,
												ChildId,
												Options,
												Id | ParentId | GrandparentIds
											> = childArgs;
											let child: ChildInstance;

											// Attach
											attachHook
												// TODO: Log error
												// eslint-disable-next-line @typescript-eslint/no-unused-vars
												.catch(reason => {
													// Nothing
												})
												.finally(() => {
													this[nameAttachChildUniverseObjects](child);
												});

											child = new (
												(this.constructor as CoreBaseClassNonRecursive).universe as CoreUniverseObjectUniverse<
													BaseClass,
													ChildInstance,
													ChildArg,
													ChildId,
													Options,
													Id | ParentId | GrandparentIds
												>
											)[nameChildUniverseObjectClass](...childArgs);

											return child;
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
										value(this: Class, path: CoreArgPath<Id, CoreArgOptionsPathOwn, ParentId | GrandparentIds>): Uuid {
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
						 * Used for semantics.
						 */
						type ParentParentId = never;

						/**
						 * Used for semantics.
						 */
						type ParentGrandparentIds = never;

						/**
						 * Parent's instance.
						 *
						 * @remarks
						 * Pseudo-instance.
						 * Parent's parent information missing, as it is not known or required. At the same time, it is unsafe to operate on anything that would depend on parent's parents or grandparents.
						 */
						type ParentInstance = CoreUniverseObjectInstance<
							BaseClass,
							CoreArgContainerArg<ParentId, Options, ParentParentId | ParentGrandparentIds, Arg, Id>,
							ParentId,
							Options,
							ParentParentId,
							ParentGrandparentIds,
							Instance,
							Arg,
							Id
						>;

						/**
						 * Universe with parent.
						 *
						 * @see {@link ParentInstance}
						 */
						type ParentUniverse = CoreUniverseObjectUniverse<
							BaseClass,
							ParentInstance,
							CoreArgContainerArg<ParentId, Options, ParentParentId | ParentGrandparentIds, Arg, Id>,
							ParentId,
							Options,
							// Parents unknown
							ParentParentId,
							ParentGrandparentIds,
							Instance,
							Arg,
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
												(this.constructor as CoreBaseClassNonRecursive).universe as ParentUniverse
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
									? // Grandparent ids are discriminated by parent id
									  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
									  [...(parentId === undefined ? [] : [parentId]), ...grandparentIds!]
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
		[ComputedClassWords.Ctor]: (() => {
			// To minimize constructor - firstly try to return without children
			if (childId === undefined) {
				return (
					// ESLint destructured param bug
					// eslint-disable-next-line @typescript-eslint/typedef
					...[, [, { created }]]: ConstructorParams
				): void => {
					created.resolve();
				};
			}

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
			const nameChildUniverseObjects: `${CoreArgObjectWords[ChildId]["pluralLowercaseWord"]}` = `${childWords.pluralLowercaseWord}`;
			const nameAddChildUniverseObject: `add${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}` =
				`add${childWords.singularCapitalizedWord}` as const; // Name of universe objects member
			const nameDefaultChildUniverseObject: `default${CoreArgObjectWords[ChildId]["singularCapitalizedWord"]}` =
				`default${childWords.singularCapitalizedWord}` as const; // Name of universe objects member

			return (
				// ESLint destructured param bug
				// eslint-disable-next-line @typescript-eslint/typedef
				...[that, [arg, { created, attachHook }, superParams], defaultChildArg]: ConstructorParams
			): void => {
				// Deal with default child
				let defaultChildCreated: DeferredPromise = new DeferredPromise();

				// Casting `as ChildInstance`, since TS for some reason, does not correctly identify a type of intersection of multiple generic keys
				((that as InstanceWithChild)[nameDefaultChildUniverseObject] as ChildInstance) =
					// Default child created synchronously, before other children
					(that as InstanceWithChild)[nameAddChildUniverseObject]([
						defaultChildArg,
						{ attachHook, created: defaultChildCreated },
						superParams
					]);

				// Deal with normal children
				Promise.all([
					// Default child created
					defaultChildCreated,

					// Rest of children created
					...Array.from(
						// Cast to keep generic info
						arg[nameChildUniverseObjects].values()
					).map(childArg => {
						let childCreated: DeferredPromise = new DeferredPromise();

						// Timeout to avoid freezing
						setTimeout(() => {
							(that as InstanceWithChild)[nameAddChildUniverseObject]([
								childArg,
								{ attachHook, created: childCreated },
								superParams
							]);
						});

						return childCreated;
					})
				])
					// TODO: Process error
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					.catch(reason => {
						// Nothing
					})
					.finally(() => {
						// Finally resolve this creation
						created.resolve();
					});
			};
		})()
	};
}
