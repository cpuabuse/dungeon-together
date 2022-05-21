/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 * @remarks
 * - `implements` should be constrained with artificial type
 * - If one pseudo-class "extends" another, artificial type should incorporate both types, while members objects should be separated, as there could be an actual class in between both
 *
 * Type constraints:
 * - When constraint is conditional {@link ComputedClassEmptyObject} should be used
 *
 * Overriding:
 * The approach is, when types cannot be inferred from actually assigned objects, then class should redefine the properties, rather than hack it with additional types.
 * - Static methods and properties should be defined in the derived as a property, as TS does not require initialization (it seems that if strict static property checking were to be introduced, it would also probably come with a definitive operator for it)
 * - Instance properties initialized by pseudo-constructor should be redefined with `!`
 */

import { MapIntersection, UnknownToObject, hasOwnProperty } from "./utility-types";

/**
 * Effectively class member key signature.
 */
type NameType = string | number | symbol;

/**
 * Empty object.
 *
 * @see {@link ComputedClassEmptyObject}
 */
type EmptyObject = Record<NameType, unknown>;

/**
 * For type constraint, when conditional type is empty.
 *
 * @remarks
 * It seems if `Record<any, unknown>` were to be used instead of object, information about another type in condition would be preserved, allowing better inference (generic type with grandparents would satisfy constraint without). That leaves the signature in the type, so to implement it, {@link ComputedClassOmitConditionalEmptyObject} should be used.
 * `object` is also injected, to guarantee unknown is not produced, for when consuming.
 */
export type ComputedClassEmptyObject = object & EmptyObject;

/**
 * Omits extra signature information from type constraint.
 *
 * @remarks
 * - `ComputedClassOmitConditionalEmptyObject<object & Record<string, unknown>>` and alike, do not omit
 * - If `EmptyObject` was passed, `R` would be inferred as unknown, so unknown check is performed to be used as a constraint, while `object` should be injected by {@link ComputedClassEmptyObject} no matter what
 */
export type ComputedClassOmitConditionalEmptyObject<T extends object> = T extends EmptyObject & infer R
	? unknown extends R
		? T
		: R
	: T;

/**
 * Words for computed class.
 */
export enum ComputedClassWords {
	Instance = "instance",
	Static = "static",
	Ctor = "ctor",

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
 * Constructor type.
 */
type ComputedClassCtor<ConstructorParams extends any[]> = {
	/**
	 * Constructor params.
	 */
	[ComputedClassWords.Ctor]: (...arg: ConstructorParams) => unknown;
};

/**
 * Partial constructor type.
 */
type ComputedClassCtorPartial<ConstructorParams extends any[]> = Partial<ComputedClassCtor<ConstructorParams>>;

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
> = ComputedClassMembersGeneratePartial<ComputedClassWords.Instance, InstanceParameters> &
	ComputedClassCtorPartial<ConstructorParams>;

/**
 * Data with members to be used in assignment functions.
 *
 * @remarks
 * Remapping needed to make this constraint satisfied with partials.
 */
type ComputedClassDataPerClass<StaticParameters extends any[]> = MapIntersection<
	ComputedClassMembersAssignPartial<ComputedClassWords.Instance> &
		ComputedClassMembersAssignPartial<ComputedClassWords.Static> &
		ComputedClassMembersGeneratePartial<ComputedClassWords.Static, StaticParameters>
>;

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
> = UnknownToObject<
	(Members extends ComputedClassMembersAssign<Include>
		? {
				[K in keyof Members[Include][ComputedClassWords.Assign] as Members[Include][ComputedClassWords.Assign][K][ComputedClassWords.Name]]: Members[Include][ComputedClassWords.Assign][K][ComputedClassWords.Value];
		  }
		: unknown) &
		(Members extends ComputedClassMembersGenerate<Include, Params>
			? {
					[K in keyof Members[Include][ComputedClassWords.Generate] as Members[Include][ComputedClassWords.Generate][K][ComputedClassWords.Name]]: ReturnType<
						Members[Include][ComputedClassWords.Generate][K][ComputedClassWords.Value]
					>;
			  }
			: unknown)
>;

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
	if (hasOwnProperty(members, ComputedClassWords.Ctor)) {
		members[ComputedClassWords.Ctor](...constructorParameters);
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
