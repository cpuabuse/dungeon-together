/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 */

import { AbstractConstructor, AbstractConstructorConstraint, ConcreteConstructor } from "./utility-types";

/**
 * Assign part of members.
 *
 * @remarks
 * When implementing, it is not necessary to exhaustively add all potential members(even if they are empty), since if a member were to be required, the return class check will fail.
 */
export type ComputedClassAssign<Property extends "assign" | "staticAssign" = "assign"> = {
	[K in Property]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			name: string;

			/**
			 * Value to assign.
			 */
			value: unknown;
		};
	};
};

/**
 * Generate part of members.
 *
 * @remarks
 * When implementing, it is not necessary to exhaustively add all potential members(even if they are empty), since if a member were to be required, the return class check will fail.
 */
export type ComputedClassGenerate<
	That = any,
	Parameter extends any[] = any[],
	Property extends "generate" | "staticGenerate" = "generate"
> = {
	[K in Property]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			name: string;

			/**
			 * Generation function.
			 */
			value: (this: That, ...arg: Parameter) => unknown;
		};
	};
};

/**
 * Type to extract members for the class.
 *
 * @remarks
 * For some reason, some information is lost if not using two subtypes.
 */
export type ComputedClassExtractInstance<
	T extends
		| ComputedClassAssign
		| ComputedClassGenerate<That, P>
		| (ComputedClassAssign & ComputedClassGenerate<That, P>),
	That = any,
	P extends any[] = any[]
> = (T extends ComputedClassAssign
	? {
			[K in keyof T["assign"] as T["assign"][K]["name"]]: T["assign"][K]["value"];
	  }
	: unknown) &
	(T extends ComputedClassGenerate<That, P>
		? {
				[K in keyof T["generate"] as T["generate"][K]["name"]]: ReturnType<T["generate"][K]["value"]>;
		  }
		: unknown);

/**
 * Type to extract members for the class.
 *
 * @remarks
 * For some reason, some information is lost if not using two subtypes.
 */
export type ComputedClassExtractClass<
	T extends
		| ComputedClassAssign<"staticAssign">
		| ComputedClassGenerate<That, P, "staticGenerate">
		| (ComputedClassAssign<"staticAssign"> & ComputedClassGenerate<That, P, "staticGenerate">),
	That = any,
	P extends any[] = any[]
> = (T extends ComputedClassAssign<"staticAssign">
	? {
			[K in keyof T["staticAssign"] as T["staticAssign"][K]["name"]]: T["staticAssign"][K]["value"];
	  }
	: unknown) &
	(T extends ComputedClassGenerate<That, P, "staticGenerate">
		? // Check that generation params match
		  T extends ComputedClassGenerate<That, P, "staticGenerate">
			? {
					[K in keyof T["staticGenerate"] as T["staticGenerate"][K]["name"]]: ReturnType<
						T["staticGenerate"][K]["value"]
					>;
			  }
			: never
		: unknown);

/**
 * Assigns data to class.
 *
 * @param param - Destructured parameter
 */
export function computedClassAssign({
	Base,
	members
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
	members: ComputedClassAssign & ComputedClassAssign<"staticAssign">;
}): void {
	Object.values(members.assign).forEach(method => {
		(Base.prototype as Record<string, unknown>)[method.name] = method.value;
	});

	Object.values(members.staticAssign).forEach(method => {
		(Base as Record<string, unknown>)[method.name] = method.value;
	});
}

/**
 * Assigns data to class.
 *
 * @param param - Destructured parameter
 */
export function computedClassGenerate<That, P extends any[]>({
	that,
	members,
	args
}: {
	/**
	 * Argument for generate functions.
	 */
	args: P;

	/**
	 * Base class.
	 */
	that: That;

	/**
	 * Members.
	 */
	members: ComputedClassGenerate<That, P>;
}): void {
	Object.values(members.generate).forEach(property => {
		(that as Record<string, unknown>)[property.name] = property.value.apply(that, args);
	});
}

/**
 * Instructions for class generation.
 */
type ComputedClassInclude =
	| ComputedClassWords.Base
	| ComputedClassWords.Populate
	| ComputedClassWords.Inject
	| ComputedClassWords.Implement;

/**
 * Words to include in the constraint data.
 */
type ComputedClassIncludeConstraint = ComputedClassInclude;

/**
 * Words to include in the actual data.
 */
type ComputedClassIncludeActual = Exclude<ComputedClassInclude, ComputedClassWords.Implement>;

/**
 * Instructions for abstract generation.
 */
type ComputedClassIncludeAbstract = ComputedClassInclude;

/**
 * Instructions for concrete generation.
 */
type ComputedClassIncludeConcrete = ComputedClassWords.Base | ComputedClassWords.Populate | ComputedClassWords.Inject;

/**
 * Helper type for generating member type.
 */
type ComputedClassGenerateMembers<
	Members extends ComputedClassMembers<Include>,
	Include extends ComputedClassInclude
> = object &
	(ComputedClassWords.Base extends Include ? Members[ComputedClassWords.Base] : unknown) &
	(ComputedClassWords.Populate extends Include ? Members[ComputedClassWords.Populate] : unknown) &
	(ComputedClassWords.Inject extends Include ? Members[ComputedClassWords.Inject] : unknown) &
	(ComputedClassWords.Implement extends Include ? Members[ComputedClassWords.Implement] : unknown);

/**
 * Helper type for generating instance member type.
 */
type ComputedClassGenerateInstance<
	Data extends ComputedClassData<Include>,
	Include extends ComputedClassInclude
> = ComputedClassGenerateMembers<Data[ComputedClassWords.Instance], Include>;

/**
 * Helper type for generating static member type.
 */
type ComputedClassGenerateStatic<
	Data extends ComputedClassData<Include>,
	Include extends ComputedClassInclude
> = ComputedClassGenerateMembers<Data[ComputedClassWords.Static], Include>;

/**
 * Class containing members.
 *
 * @remarks
 * Base, concrete and abstract parameters are not separated per static and instance, as they are respectively mutually inclusive.
 * For both static and instance part:
 * - When used as concrete `this`, base and concrete are present, abstract is absent
 * - When used as abstract `this`, base, concrete and abstract are present
 * - When used as final class, base, concrete and abstract are present
 */
type ComputedClassGenerateClass<
	Data extends ComputedClassData<Include>,
	Include extends ComputedClassInclude,
	Parameters extends any[]
> = AbstractConstructor<Parameters, ComputedClassGenerateInstance<Data, Include>> &
	ComputedClassGenerateStatic<Data, Include>;

/**
 * Class constraint.
 *
 * @remarks
 * Base, concrete and abstract parameters are not separated per static and instance, as they are respectively mutually inclusive.
 * For both static and instance part:
 * - When used as final class constraint, base, concrete and abstract are present
 * - When used as abstract implementation constraint, base and concrete are absent, abstract is present
 * - When used as concrete part of the final constraint to check that concrete part of the actual resulting class satisfies it, base and concrete are present, abstract is absent
 */
type ComputedClassGenerateClassConstraint<
	Data extends ComputedClassData<Include>,
	Include extends ComputedClassInclude
> = AbstractConstructorConstraint<ComputedClassGenerateInstance<Data, Include>> &
	ComputedClassGenerateStatic<Data, Include>;

/**
 * Enum to index {@link ComputedClassData}.
 */
export enum ComputedClassWords {
	/**
	 * Members taken from base class.
	 *
	 * In constraint is constraint of base class.
	 * In actual is actual base class.
	 */
	Base = "Base",

	/**
	 * Part of the class to be populated by extending class.
	 *
	 * In constraint is own statically known properties, and inherited for implementation `Implement` of base.
	 * In actual is class itself.
	 */
	Populate = "Populate",

	/**
	 * Members populated statically within `class` block.
	 *
	 * In constraint, dynamic members of class.
	 * In actual is an injection via this file's injection functions.
	 */
	Inject = "Inject",

	/**
	 * Members assigned via prototype.
	 *
	 * In constraint, members to be implemented by extending class.
	 * In actual does not exist.
	 */
	Implement = "Implement",

	Instance = "Instance",
	Static = "Static",

	ThisInstanceConcrete = "ThisInstanceConcrete",
	ThisInstanceAbstract = "ThisInstanceAbstract",
	ThisStaticConcrete = "ThisStaticConcrete",
	ThisStaticAbstract = "ThisStaticAbstract",
	ClassImplements = "ClassImplements",
	ClassReturn = "ClassReturn"
}

/**
 * Subtype for {@link ComputedClassData}.
 *
 * Can be used as mask.
 */
type ComputedClassMembers<Include extends ComputedClassInclude> = {
	/**
	 * Members.
	 */
	[K in Include]: object;
};

/**
 * Members for constraint data.
 */
export type ComputedClassConstraintMembers = ComputedClassMembers<ComputedClassIncludeConstraint>;

/**
 * Members for actual data.
 */
export type ComputedClassActualMembers = ComputedClassMembers<ComputedClassIncludeActual>;

/**
 * Repository for computed class types.
 *
 * @remarks
 * Base class must be separated into instance and static, otherwise properties cannot be inferred, if generic is generic.
 */
type ComputedClassData<Include extends ComputedClassInclude> = {
	/**
	 * Instance part of the class.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers<Include>;

	/**
	 * Static part of the class, which can have a constructor in base.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers<Include>;
};

/**
 * Constraint data.
 */
export type ComputedClassConstraintData<
	Data extends ComputedClassData<ComputedClassIncludeConstraint> = ComputedClassData<ComputedClassIncludeConstraint>
> = Data;

/**
 * Actual data.
 */
export type ComputedClassActualData<
	Data extends ComputedClassData<ComputedClassIncludeActual> = ComputedClassData<ComputedClassIncludeActual>
> = Data;

/**
 * Used to generate base data for classes extending computed class.
 *
 * @typeParam Include - {@link ComputedClassWords.Populate} to populate with abstract members or not
 * @remarks
 * Since populate defines class' `implements`, members must be statically known, thus:
 * - When some members to go into implement, to be intersected manually, with exhaustive index access based on `keyof`.
 * - When used with condition, to be intersected per member, manually (All members go into implement instead of populate).
 *
 * Plain intersection is fine, as when condition above happen, `implements` will error.
 */
export type ComputedClassDataExtends<Data extends ComputedClassData<ComputedClassIncludeConstraint>> = {
	/**
	 * Instance.
	 */
	[ComputedClassWords.Instance]: {
		/**
		 * Base.
		 */
		[ComputedClassWords.Base]: ComputedClassGenerateInstance<Data, ComputedClassIncludeConcrete>;

		/**
		 * Populate.
		 */
		[ComputedClassWords.Populate]: ComputedClassGenerateInstance<Data, ComputedClassWords.Implement>;
	};

	/**
	 * Static, which can have a constructor in base.
	 */
	[ComputedClassWords.Static]: {
		/**
		 * Base.
		 */
		[ComputedClassWords.Base]: ComputedClassGenerateStatic<Data, ComputedClassIncludeConcrete>;

		/**
		 * Populate.
		 */
		[ComputedClassWords.Populate]: ComputedClassGenerateStatic<Data, ComputedClassWords.Implement>;
	};
};

/**
 * What extending class should implement.
 */
export type ComputedClassClassImplements<Data extends ComputedClassData<ComputedClassIncludeConstraint>> =
	ComputedClassGenerateClassConstraint<Data, ComputedClassWords.Implement>;

/**
 * Instance type constraint.
 */
export type ComputedClassInstanceConstraint<Data extends ComputedClassData<ComputedClassIncludeConstraint>> =
	ComputedClassGenerateInstance<Data, ComputedClassIncludeAbstract>;

/**
 * Class type constraint.
 *
 * @remarks
 * Is a concrete constraint.
 */
export type ComputedClassClassConstraint<
	Data extends ComputedClassData<ComputedClassIncludeConstraint>,
	Parameters extends any[] = any
> = ConcreteConstructor<Parameters, ComputedClassGenerateInstance<Data, ComputedClassIncludeAbstract>> &
	ComputedClassGenerateStatic<Data, ComputedClassIncludeAbstract>;

/**
 * Info for computed class.
 */
export type ComputedClassInfo<
	ConstraintData extends ComputedClassConstraintData,
	ActualData extends ComputedClassActualData,
	Parameters extends any[]
> = {
	/**
	 * `this` for concrete instance.
	 */
	[ComputedClassWords.ThisInstanceConcrete]: ComputedClassGenerateInstance<
		ConstraintData,
		ComputedClassIncludeConcrete
	>;

	/**
	 * `this` for abstract instance.
	 */
	[ComputedClassWords.ThisInstanceAbstract]: ComputedClassGenerateInstance<
		ConstraintData,
		ComputedClassIncludeAbstract
	>;

	/**
	 * `this` for concrete static.
	 */
	[ComputedClassWords.ThisStaticConcrete]: ComputedClassGenerateClass<
		ConstraintData,
		ComputedClassIncludeConcrete,
		Parameters
	>;

	/**
	 * `this` for abstract static.
	 */
	[ComputedClassWords.ThisStaticAbstract]: ComputedClassGenerateClass<
		ConstraintData,
		ComputedClassIncludeAbstract,
		Parameters
	>;

	/**
	 * Actual class block to implement.
	 */
	[ComputedClassWords.ClassImplements]: ComputedClassGenerateClassConstraint<
		ConstraintData,
		ComputedClassWords.Populate
	>;

	/**
	 * Actual class to return.
	 *
	 * @remarks
	 * Checks final return value, even though it might be redundant.
	 * - `Base` checks that it is properly extending
	 * - `Inject` checks that injection went successfully
	 * - `Populate` is redundant, if `implements` was used, still might be necessary for type inference in generics
	 * - `Implement` is skipped, as it is not produced
	 */
	[ComputedClassWords.ClassReturn]: ComputedClassGenerateClass<
		ActualData,
		ComputedClassIncludeConcrete,
		Parameters
		// Check that class type satisfies constraint, to extract class in generic factories, and to check that final result matches constraints used outside of factories, without abstract part
	> extends ComputedClassGenerateClassConstraint<ConstraintData, ComputedClassIncludeConcrete>
		? ComputedClassGenerateClass<ActualData, ComputedClassIncludeConcrete, Parameters>
		: never;
};
