/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Core args.
 *
 * Conversion functions shared functionality is implemented here, and not as static members of classes, as universe object is implemented via interface merging, and there is no actual super class to add methods to. On top of that, it would not be possible to type a method without determined arg, that is dependent on options, so if these methods were to be implemented they should be implemented at determined universe object level, defeating the purpose of code reuse.
 *
 * @file
 */

// Reexport
export * from "./arg";
export * from "./args-container";
export * from "./arg-container-arg";
export * from "./meta";
export * from "./options";
export * from "./path";
export * from "./words";
export * from "./map";
export * from "./convert";
export * from "./convert-path";
export * from "./vector";
