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
 *
 * @remarks
 * Parameters are required, for type safety, as generate is run during initialization, and it's parameters might not affect the result (return value used instead), but can break things, if parameters are inconsistent.
 */
type ComputedClassGenerate<Parameters extends any[]> = {
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
			[ComputedClassWords.Value]: (...arg: Parameters) => unknown;
		};
	};
};

/**
 * Accepted general members object.
 */
type ComputedClassMembers<Parameters extends any[]> = Partial<ComputedClassAssign & ComputedClassGenerate<Parameters>>;

/**
 * Instance part of members.
 */
type ComputedClassInstance<Parameters extends any[]> = {
	/**
	 * Instance.
	 */
	[ComputedClassWords.Instance]: ComputedClassMembers<Parameters>;
};

/**
 * Static part of members.
 */
type ComputedClassStatic<Parameters extends any[]> = {
	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers<Parameters>;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerInstance<Parameters extends any[]> = {
	/**
	 * Members.
	 */
	[ComputedClassWords.Instance]: Partial<ComputedClassGenerate<Parameters>>;
};

/**
 * Data with members to be used in assignment functions.
 */
type ComputedClassDataPerClass<Parameters extends any[]> = {
	/**
	 * Members.
	 */
	[ComputedClassWords.Instance]: Partial<ComputedClassAssign>;

	/**
	 * Static.
	 */
	[ComputedClassWords.Static]: ComputedClassMembers<Parameters>;
};

/**
 * Type to extract members for the class.
 * Takes members information and puts it as key-value pairs.
 *
 * @remarks
 * While in generic, cannot create type with generic keys from extraction.
 */
type ComputedClassExtract<T extends ComputedClassMembers<P>, P extends any[]> = (T extends ComputedClassAssign
	? {
			[K in keyof T[ComputedClassWords.Assign] as T[ComputedClassWords.Assign][K][ComputedClassWords.Name]]: T[ComputedClassWords.Assign][K][ComputedClassWords.Value];
	  }
	: ComputedClassEmptyType) &
	(T extends ComputedClassGenerate<P>
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
	T extends Partial<ComputedClassInstance<Parameters>>,
	Parameters extends any[]
> = T extends ComputedClassInstance<Parameters>
	? ComputedClassExtract<T[ComputedClassWords.Instance], Parameters>
	: ComputedClassEmptyType;

/**
 * Type to extract members for the class.
 */
export type ComputedClassExtractStatic<
	T extends Partial<ComputedClassStatic<Parameters>>,
	Parameters extends any[]
> = T extends ComputedClassStatic<Parameters>
	? ComputedClassExtract<T[ComputedClassWords.Static], Parameters>
	: ComputedClassEmptyType;

/**
 * Assigns data to class.
 * Called from the constructor.
 *
 * @param param - Destructured parameter
 */
export function computedClassInjectPerInstance<Parameters extends any[]>({
	instance,
	members,
	parameters
}: {
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
	members: ComputedClassDataPerInstance<Parameters>;
}): void {
	if (hasOwnProperty(members, ComputedClassWords.Instance)) {
		let instanceMember: Partial<ComputedClassGenerate<Parameters>> = members[ComputedClassWords.Instance];
		if (hasOwnProperty(instanceMember, ComputedClassWords.Generate)) {
			Object.values(instanceMember[ComputedClassWords.Generate]).forEach(property => {
				(instance as Record<string, unknown>)[property.name] = property.value(...parameters);
			});
		}
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
		let staticMember: ComputedClassMembers<Parameters> = members[ComputedClassWords.Static];
		if (hasOwnProperty(staticMember, ComputedClassWords.Assign)) {
			Object.values(staticMember[ComputedClassWords.Assign]).forEach(method => {
				(Base as Record<string, unknown>)[method.name] = method.value;
			});
		}

		// BUG: For some reason `staticMember` type is changed after the previous call to `hasOwnProperty`, so casting thrice; Probably a TS bug
		if (hasOwnProperty(staticMember as ComputedClassMembers<Parameters>, ComputedClassWords.Generate)) {
			Object.values(
				(staticMember as ComputedClassMembers<Parameters>)[ComputedClassWords.Generate] as Exclude<
					ComputedClassMembers<Parameters>[ComputedClassWords.Generate],
					undefined
				>
			).forEach(method => {
				(Base as Record<string, unknown>)[method.name] = method.value(...parameters);
			});
		}
	}
}
