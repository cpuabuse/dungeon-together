/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 * @remarks
 * - `implements` should be constrained with artificial type
 * - If one pseudo-class "extends" another, artificial type should incorporate both types, while members objects should be separated, as there could be an actual class in between both
 */

import { MapIntersection, hasOwnProperty } from "./utility-types";

/**
 * Type to be produced when extracting, when empty.
 */
type EmptyType = unknown;

/**
 * Effectively class member key signature.
 */
type NameType = string | number | symbol;

/**
 * For when conditional type is empty.
 *
 * @remarks
 * It seems that `object` does not give indication a potential record, and information from potentially condition succeeding is gone.
 */
export type EmptyObject = Record<string | number | symbol, unknown>;

/**
 * Words for computed class.
 */
export enum ComputedClassWords {
	Instance = "instance",
	Static = "static",
	Constructor = "constructor",

	// Static(not dynamic) information
	Assign = "assign",
	// Dynamic information
	Generate = "generate",

	// Property names
	Name = "name",
	Value = "value"
}

/**
 * Instance or static property to include into members.
 * To be used one at a time.
 */
type ComputedClassInclude = ComputedClassWords.Instance | ComputedClassWords.Static;

/**
 * Accepted general assign members object.
 */
type ComputedClassMembersAssign<Include extends ComputedClassInclude> = {
	/**
	 * Instance.
	 */
	[K in Include]: {
		/**
		 * Assign.
		 */
		[ComputedClassWords.Assign]: {
			[key: string]: {
				/**
				 * Name of the property.
				 */
				[ComputedClassWords.Name]: NameType;

				/**
				 * Value to assign.
				 *
				 * @remarks
				 * Not using {@link EmptyType} intentionally (expected type is more known).
				 */
				[ComputedClassWords.Value]: unknown;
			};
		};
	};
};

/**
 * Accepted general generate members object.
 *
 *  @remarks
 * Parameters are required, for type safety, as generate is run during initialization, and it's parameters might not affect the result (return value used instead), but can break things, if parameters are inconsistent.
 */
type ComputedClassMembersGenerate<Include extends ComputedClassInclude, Params extends any[]> = {
	/**
	 * Instance.
	 */
	[K in Include]: {
		/**
		 * Generate.
		 */
		[ComputedClassWords.Generate]: {
			[key: string]: {
				/**
				 * Name of the property.
				 */
				[ComputedClassWords.Name]: NameType;

				/**
				 * Generation function.
				 */
				[ComputedClassWords.Value]: (...arg: Params) => unknown;
			};
		};
	};
};

/**
 * Accepted general assign members object.
 */
type ComputedClassMembersAssignPartial<Include extends ComputedClassInclude> = {
	/**
	 * Instance.
	 */
	[K in keyof ComputedClassMembersAssign<Include>]?: Partial<ComputedClassMembersAssign<Include>[K]>;
};

/**
 * Accepted general generate members object.
 */
type ComputedClassMembersGeneratePartial<Include extends ComputedClassInclude, Params extends any[]> = {
	/**
	 * Instance.
	 */
	[K in keyof ComputedClassMembersGenerate<Include, Params>]?: Partial<
		ComputedClassMembersGenerate<Include, Params>[K]
	>;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerInstance<
	InstanceParameters extends any[],
	ConstructorParams extends any[]
> = ComputedClassMembersGeneratePartial<ComputedClassWords.Instance, InstanceParameters> & {
	/**
	 * Constructor params.
	 */
	[ComputedClassWords.Constructor]?: (...arg: ConstructorParams) => void;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerClass<StaticParameters extends any[]> =
	ComputedClassMembersAssignPartial<ComputedClassWords.Instance> &
		ComputedClassMembersAssignPartial<ComputedClassWords.Static> &
		ComputedClassMembersGeneratePartial<ComputedClassWords.Static, StaticParameters>;

/**
 * Members tuple to be consumed by merge function.
 */
type ComputedClassMembers = ComputedClassMembersAssignPartial<ComputedClassWords.Instance> &
	ComputedClassMembersGeneratePartial<ComputedClassWords.Instance, any[]> &
	ComputedClassMembersAssignPartial<ComputedClassWords.Static> &
	ComputedClassMembersGeneratePartial<ComputedClassWords.Static, any[]>;

/**
 * Merging multiple members.
 */
type ComputedClassDeepMerge<MembersTuple extends ComputedClassMembers[]> = MembersTuple extends [infer Members]
	? Extract<Members, ComputedClassMembers>
	: MembersTuple extends [infer M, ...infer R]
	? R extends ComputedClassMembers[]
		? M & ComputedClassDeepMerge<R>
		: never
	: never;

/**
 * Type to extract members for the class.
 * Takes members information and puts it as key-value pairs.
 *
 * @remarks
 * While in generic, cannot create type with generic keys from extraction.
 */
type ComputedClassExtract<
	Members extends ComputedClassMembersAssignPartial<Include> & ComputedClassMembersGeneratePartial<Include, Params>,
	Include extends ComputedClassInclude,
	Params extends any[]
> = Record<string | number | symbol, unknown> &
	(Members extends ComputedClassMembersAssign<Include>
		? {
				[K in keyof Members[Include][ComputedClassWords.Assign] as Members[Include][ComputedClassWords.Assign][K][ComputedClassWords.Name]]: Members[Include][ComputedClassWords.Assign][K][ComputedClassWords.Value];
		  }
		: EmptyType) &
	(Members extends ComputedClassMembersGenerate<Include, Params>
		? {
				[K in keyof Members[Include][ComputedClassWords.Generate] as Members[Include][ComputedClassWords.Generate][K][ComputedClassWords.Name]]: ReturnType<
					Members[Include][ComputedClassWords.Generate][K][ComputedClassWords.Value]
				>;
		  }
		: EmptyType);

/**
 * Helper type, for extract constraint.
 *
 * @remarks
 * Constraint used to remove faulty inference with of intersection with mapped type (happens when generics involved).
 *
 * @see {@link MapIntersection}
 */
export type ComputedClassExtractConstraint<
	Include extends ComputedClassInclude,
	Params extends any[]
> = MapIntersection<ComputedClassMembersAssignPartial<Include> & ComputedClassMembersGeneratePartial<Include, Params>>;

/**
 * Type to extract members for the class.
 */
export type ComputedClassExtractInstance<
	Members extends ComputedClassExtractConstraint<ComputedClassWords.Instance, Params>,
	Params extends any[]
> = ComputedClassExtract<Members, ComputedClassWords.Instance, Params>;

/**
 * Type to extract members for the class.
 */
export type ComputedClassExtractStatic<
	Members extends ComputedClassExtractConstraint<ComputedClassWords.Static, Params>,
	Params extends any[]
> = ComputedClassExtract<Members, ComputedClassWords.Static, Params>;

/**
 * Assigns data to class.
 * Called from the constructor.
 *
 * @param param - Destructured parameter
 */
export function computedClassInjectPerInstance<Parameters extends any[], ConstructorParams extends any[]>({
	constructorParameters,
	instance,
	members,
	parameters
}: {
	/**
	 * Constructor parameters.
	 */
	constructorParameters: ConstructorParams;

	/**
	 * Argument for generate functions.
	 */
	parameters: Parameters;

	/**
	 * Instance.
	 */
	instance: object;

	/**
	 * Members.
	 */
	members: ComputedClassDataPerInstance<Parameters, ConstructorParams>;
}): void {
	// Deal with instance
	Object.values(members?.[ComputedClassWords.Instance]?.[ComputedClassWords.Generate] ?? {}).forEach(property => {
		(instance as Record<NameType, unknown>)[property.name] = property.value(...parameters);
	});

	// Finally, call pseudo-constructor, after instance generation, so that the members are already available
	if (hasOwnProperty(members, ComputedClassWords.Constructor)) {
		members[ComputedClassWords.Constructor](...constructorParameters);
	}
}

/**
 * Injects data into class.
 *
 * @param param - Destructured parameter
 */
export function computedClassInjectPerClass<Parameters extends any[]>({
	Base,
	members,
	parameters
}: {
	/**
	 * Base class.
	 */
	Base: {
		/**
		 * Prototype.
		 */
		prototype: unknown;
	};

	/**
	 * Members.
	 */
	members: ComputedClassDataPerClass<Parameters>;

	/**
	 * Parameters.
	 */
	parameters: Parameters;
}): void {
	// Deal with instance
	Object.values(members?.[ComputedClassWords.Instance]?.[ComputedClassWords.Assign] ?? {}).forEach(method => {
		(Base.prototype as Record<NameType, unknown>)[method.name] = method.value;
	});

	// Deal with static
	let staticMembers: ComputedClassDataPerClass<Parameters>[ComputedClassWords.Static] =
		members?.[ComputedClassWords.Static];
	if (staticMembers !== undefined) {
		Object.values(staticMembers?.[ComputedClassWords.Assign] ?? {}).forEach(method => {
			(Base as Record<NameType, unknown>)[method.name] = method.value;
		});

		Object.values(staticMembers?.[ComputedClassWords.Generate] ?? {}).forEach(method => {
			(Base as Record<NameType, unknown>)[method.name] = method.value(...parameters);
		});
	}
}

/**
 * Merges multiple members.
 *
 * @param param - Destructured parameter
 * @remarks
 * `any[]` used as constraint for generate arguments.
 *
 * @returns Merged members
 */
export function computedClassDeepMerge<MembersTuple extends ComputedClassMembers[]>({
	membersArray
}: {
	/**
	 * Tuple of members.
	 *
	 * @remarks
	 * Variadic preserves tuple. Array would produce a union type.
	 */
	membersArray: [...MembersTuple];
}): ComputedClassDeepMerge<MembersTuple> {
	return membersArray.reduce((previous, current) => {
		return {
			[ComputedClassWords.Instance]: {
				[ComputedClassWords.Assign]: {
					...previous?.[ComputedClassWords.Instance]?.[ComputedClassWords.Assign],
					...current?.[ComputedClassWords.Instance]?.[ComputedClassWords.Assign]
				},
				[ComputedClassWords.Generate]: {
					...previous?.[ComputedClassWords.Instance]?.[ComputedClassWords.Generate],
					...current?.[ComputedClassWords.Instance]?.[ComputedClassWords.Generate]
				}
			},

			[ComputedClassWords.Static]: {
				[ComputedClassWords.Assign]: {
					...previous?.[ComputedClassWords.Static]?.[ComputedClassWords.Assign],
					...current?.[ComputedClassWords.Static]?.[ComputedClassWords.Assign]
				},
				[ComputedClassWords.Generate]: {
					...previous?.[ComputedClassWords.Static]?.[ComputedClassWords.Generate],
					...current?.[ComputedClassWords.Static]?.[ComputedClassWords.Generate]
				}
			}
		};
		// Hard-cast as difficult to infer
	}) as ComputedClassDeepMerge<MembersTuple>;
}
