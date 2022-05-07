/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Working with classes with computed properties.
 */

import { hasOwnProperty } from "./utility-types";

/**
 * Type to be produced when extracting, when empty.
 */
type ComputedClassEmptyType = unknown;

/**
 * Words for computed class.
 */
export enum ComputedClassWords {
	Instance = "instance",
	Static = "static",

	// Static(not dynamic) information
	Assign = "assign",
	// Dynamic information
	Generate = "generate",

	// Property names
	Name = "name",
	Value = "value"
}

/**
 * Assign part of members.
 */
type ComputedClassAssign = {
	/**
	 * Assign.
	 */
	[ComputedClassWords.Assign]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			[ComputedClassWords.Name]: string;

			/**
			 * Value to assign.
			 */
			[ComputedClassWords.Value]: unknown;
		};
	};
};

/**
 * Generate part of members.
 */
type ComputedClassGenerate<That extends object, Parameter extends any[]> = {
	/**
	 * Generate.
	 */
	[ComputedClassWords.Generate]: {
		[key: string]: {
			/**
			 * Name of the property.
			 */
			[ComputedClassWords.Name]: string;

			/**
			 * Generation function.
			 */
			[ComputedClassWords.Value]: (this: That, ...arg: Parameter) => unknown;
		};
	};
};

/**
 * Accepted general members object.
 */
type ComputedClassMembers<That extends object, Parameter extends any[]> = Partial<
	ComputedClassAssign & ComputedClassGenerate<That, Parameter>
>;

/**
 * Instance part of members.
 */
type ComputedClassInstance<That extends object, Parameter extends any[]> = {
	/**
	 * Instance.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers<That, Parameter>;
};

/**
 * Static part of members.
 */
type ComputedClassStatic<That extends object, Parameter extends any[]> = {
	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers<That, Parameter>;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerInstance<That extends object, Parameter extends any[]> = {
	/**
	 * Members.
	 */
	[ComputedClassWords.Instance]: Partial<ComputedClassGenerate<That, Parameter>>;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerClass<That extends object, Parameter extends any[]> = {
	/**
	 * Members.
	 */
	[ComputedClassWords.Instance]: Partial<ComputedClassAssign>;

	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers<That, Parameter>;
};

/**
 * Type to extract members for the class.
 * Takes members information and puts it as key-value pairs.
 */
type ComputedClassExtract<
	T extends ComputedClassMembers<That, P>,
	That extends object,
	P extends any[]
> = (T extends ComputedClassAssign
	? {
			[K in keyof T[ComputedClassWords.Assign] as T[ComputedClassWords.Assign][K][ComputedClassWords.Name]]: T[ComputedClassWords.Assign][K][ComputedClassWords.Value];
	  }
	: ComputedClassEmptyType) &
	(T extends ComputedClassGenerate<That, P>
		? {
				[K in keyof T[ComputedClassWords.Generate] as T[ComputedClassWords.Generate][K][ComputedClassWords.Name]]: ReturnType<
					T[ComputedClassWords.Generate][K][ComputedClassWords.Value]
				>;
		  }
		: ComputedClassEmptyType);

/**
 * Type to extract members for the class.
 */
export type ComputedClassExtractInstance<
	T extends Partial<ComputedClassInstance<That, Parameter>>,
	That extends object,
	Parameter extends any[]
> = T extends ComputedClassInstance<That, Parameter>
	? ComputedClassExtract<T[ComputedClassWords.Instance], That, Parameter>
	: ComputedClassEmptyType;

/**
 * Type to extract members for the class.
 */
export type ComputedClassExtractStatic<
	T extends Partial<ComputedClassStatic<That, Parameter>>,
	That extends object,
	Parameter extends any[]
> = T extends ComputedClassStatic<That, Parameter>
	? ComputedClassExtract<T[ComputedClassWords.Static], That, Parameter>
	: ComputedClassEmptyType;

/**
 * Assigns data to class.
 * Called from the constructor.
 *
 * @param param - Destructured parameter
 */
export function computedClassInjectPerInstance<That extends object, Parameter extends any[]>({
	that,
	members,
	args
}: {
	/**
	 * Argument for generate functions.
	 */
	args: Parameter;

	/**
	 * Instance.
	 */
	that: That;

	/**
	 * Members.
	 */
	members: ComputedClassDataPerInstance<That, Parameter>;
}): void {
	if (hasOwnProperty(members, ComputedClassWords.Instance)) {
		if (hasOwnProperty(members[ComputedClassWords.Instance], ComputedClassWords.Generate)) {
			Object.values(
				members[ComputedClassWords.Instance][ComputedClassWords.Generate] as Exclude<
					typeof members[ComputedClassWords.Instance][ComputedClassWords.Generate],
					undefined
				>
			).forEach(property => {
				(that as Record<string, unknown>)[property.name] = property.value.apply(that, args);
			});
		}
	}
}

/**
 * Injects data into class.
 *
 * @param param - Destructured parameter
 */
export function computedClassInjectPerClass<
	That extends {
		/**
		 * Prototype.
		 */
		prototype: unknown;
	},
	Parameter extends any[]
>({
	Base,
	members
}: {
	/**
	 * Base class.
	 */
	Base: That;

	/**
	 * Members.
	 */
	members: ComputedClassDataPerClass<That, Parameter>;
}): void {
	// Deal with instance
	if (hasOwnProperty(members, ComputedClassWords.Instance)) {
		let instance: Partial<ComputedClassAssign> = members[ComputedClassWords.Instance];
		if (hasOwnProperty(instance, ComputedClassWords.Assign)) {
			Object.values(instance[ComputedClassWords.Assign]).forEach(method => {
				(Base.prototype as Record<string, unknown>)[method.name] = method.value;
			});
		}
	}

	// Deal with static
	if (hasOwnProperty(members, ComputedClassWords.Static)) {
		let staticMember: ComputedClassMembers<That, Parameter> = members[ComputedClassWords.Static];
		if (hasOwnProperty(staticMember, ComputedClassWords.Assign)) {
			Object.values(staticMember[ComputedClassWords.Assign]).forEach(method => {
				(Base as Record<string, unknown>)[method.name] = method.value;
			});
		}

		// BUG: For some reason `staticMember` type is changed after the previous call to `hasOwnProperty`, so casting thrice; Probably a TS bug
		if (hasOwnProperty(staticMember as ComputedClassMembers<That, Parameter>, ComputedClassWords.Generate)) {
			Object.values(
				(staticMember as ComputedClassMembers<That, Parameter>)[ComputedClassWords.Generate] as Exclude<
					ComputedClassMembers<That, Parameter>[ComputedClassWords.Generate],
					undefined
				>
			).forEach(method => {
				(Base as Record<string, unknown>)[method.name] = method.value;
			});
		}
	}
}
