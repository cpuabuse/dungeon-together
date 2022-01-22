/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Arg conversion
 */

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
