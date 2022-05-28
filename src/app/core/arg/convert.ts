/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Arg conversion
 */

import { CoreArg, CoreArgIds } from "./arg";
import { CoreArgMeta } from "./meta";
import { CoreArgOptionsUnion } from "./options";
import { CoreArgObjectWords } from "./words";

/**
 * Principles of arg conversion functions:
 * - Properties of one part of arg(e.g. path), should not require the changes of properties of another part
 * - Conversion function returns only the properties related to that arg part
 * - If the property values of one arg part, depend on properties of another, there should be a middle-man function, that calls both conversions
 * - If the dependency is bidirectional, there should be one merged conversion function, possibly producing results optionally
 *
 * These principles, allow the usage of `Object.assign` function for final conversion.
 *
 * @remarks
 * This is for documentation purposes only.
 */
export type CoreArgConvertDoc = never;

/**
 * Converter function type.
 */
export type CoreArgConverter<
	SourceArg extends CoreArg<Id, SourceOptions, ParentIds>,
	TargetArg extends CoreArg<Id, TargetOptions, ParentIds>,
	Id extends CoreArgIds,
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion,
	ParentIds extends CoreArgIds = never
> = (
	params: {
		/**
		 * Target source entity.
		 */
		[K in `${CoreArgObjectWords[Id]["singularLowercaseWord"]}`]: SourceArg;
	} & {
		/**
		 * Source options.
		 */
		sourceOptions: SourceOptions;

		/**
		 * Target options.
		 */
		targetOptions: TargetOptions;

		/**
		 * Meta for entity.
		 */
		meta: CoreArgMeta<Id, SourceOptions, TargetOptions, ParentIds>;
	}
) => TargetArg;

/**
 * Constraint for converter of any arguments.
 */
export type CoreArgConverterConstraint<Id extends CoreArgIds, ParentIds extends CoreArgIds = never> = <
	SourceOptions extends CoreArgOptionsUnion,
	TargetOptions extends CoreArgOptionsUnion
>(
	...args: Parameters<CoreArgConverter<any, any, Id, SourceOptions, TargetOptions, ParentIds>>
) => ReturnType<CoreArgConverter<any, any, Id, SourceOptions, TargetOptions, ParentIds>>;
