/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 */

import { AbstractConstructor, AbstractConstructorConstraint } from "./utility-types";

/**
 * Assign part of members.
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
 */
export type ComputedClassGenerate<
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
			value: (...arg: Parameter) => unknown;
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
	T extends ComputedClassAssign | ComputedClassGenerate<P> | (ComputedClassAssign & ComputedClassGenerate<P>),
	P extends any[] = any[]
> = (T extends ComputedClassAssign
	? {
			[K in keyof T["assign"] as T["assign"][K]["name"]]: T["assign"][K]["value"];
	  }
	: unknown) &
	(T extends ComputedClassGenerate<P>
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
		| ComputedClassGenerate<P, "staticGenerate">
		| (ComputedClassAssign<"staticAssign"> & ComputedClassGenerate<P, "staticGenerate">),
	P extends any[] = any[]
> = (T extends ComputedClassAssign<"staticAssign">
	? {
			[K in keyof T["staticAssign"] as T["staticAssign"][K]["name"]]: T["staticAssign"][K]["value"];
	  }
	: unknown) &
	(T extends ComputedClassGenerate<P, "staticGenerate">
		? // Check that generation params match
		  T extends ComputedClassGenerate<P, "staticGenerate">
			? {
					[K in keyof T["staticGenerate"] as T["staticGenerate"][K]["name"]]: ReturnType<
						T["staticGenerate"][K]["value"]
					>;
			  }
			: never
		: unknown);

/**
 * Instructions for class generation.
 */
type ComputedClassInclude =
	| ComputedClassWords.Base
	| ComputedClassWords.Populate
	| ComputedClassWords.Inject
	| ComputedClassWords.Implement;

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
type ComputedClassGenerateMembers<Members extends ComputedClassMembers, Include extends ComputedClassInclude> = object &
	(ComputedClassWords.Base extends Include ? Members[ComputedClassWords.Base] : unknown) &
	(ComputedClassWords.Populate extends Include ? Members[ComputedClassWords.Populate] : unknown) &
	(ComputedClassWords.Inject extends Include ? Members[ComputedClassWords.Inject] : unknown) &
	(ComputedClassWords.Implement extends Include ? Members[ComputedClassWords.Implement] : unknown);

/**
 * Helper type for generating instance member type.
 */
type ComputedClassGenerateInstance<
	Data extends ComputedClassData,
	Include extends ComputedClassInclude
> = ComputedClassGenerateMembers<Data[ComputedClassWords.Instance], Include>;

/**
 * Helper type for generating static member type.
 */
type ComputedClassGenerateStatic<
	Data extends ComputedClassData,
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
	Data extends ComputedClassData,
	Include extends ComputedClassInclude,
	Parameters extends any[]
> = AbstractConstructor<Parameters> & // Inject the parameters, order over static classes matters (first constructor parameters will be used)
	AbstractConstructorConstraint<ComputedClassGenerateInstance<Data, Include>> & // Inject the instance members
	ComputedClassGenerateStatic<Data, Include>; // Inject the static members

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
	Data extends ComputedClassData,
	Include extends ComputedClassInclude
> = ComputedClassGenerateStatic<Data, Include> &
	AbstractConstructorConstraint<ComputedClassGenerateInstance<Data, Include>>;

/**
 * Enum to index {@link ComputedClassData}.
 */
export enum ComputedClassWords {
	/**
	 * Members taken from base class.
	 */
	Base = "Base",

	/**
	 * Part of the class to be populated by extending class.
	 */
	Populate = "Populate",

	/**
	 * Members populated statically within `class` block.
	 */
	Inject = "Inject",

	/**
	 * Members assigned via prototype.
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
export type ComputedClassMembers = {
	/**
	 * Members.
	 */
	[K in ComputedClassInclude]: object;
};

/**
 * Repository for computed class types.
 *
 *
 * @remarks
 * Base class must be separated into instance and static, otherwise properties cannot be inferred, if generic is generic.
 */
export type ComputedClassData<
	Data extends ComputedClassData = {
		/**
		 * Instance part of the class.
		 */
		[ComputedClassWords.Instance]: ComputedClassMembers;

		/**
		 * Static part of the class.
		 */
		[ComputedClassWords.Static]: ComputedClassMembers;
	}
> = Data;

/**
 * Used to generate base data for classes extending computed class.
 *
 * @typeParam Include - {@link ComputedClassWords.Populate} to populate with abstract members or not
 */
export type ComputedClassDataExtends<Data extends ComputedClassData> = {
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
	 * Static.
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
export type ComputedClassClassImplements<Data extends ComputedClassData> = ComputedClassGenerateClassConstraint<
	Data,
	ComputedClassWords.Implement
>;

/**
 * Instance type constraint.
 */
export type ComputedClassInstanceConstraint<Data extends ComputedClassData> = InstanceType<
	ComputedClassClassConstraint<Data>
>;

/**
 * Class type constraint.
 */
export type ComputedClassClassConstraint<Data extends ComputedClassData> = ComputedClassGenerateClassConstraint<
	Data,
	ComputedClassIncludeAbstract
>;

/**
 * Info for computed class.
 */
export type ComputedClassInfo<
	ConstraintData extends ComputedClassData,
	ActualData extends ComputedClassData,
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
