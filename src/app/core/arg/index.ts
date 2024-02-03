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
export * from "./container-arg";
export * from "./container";
export * from "./convert-arg";
export * from "./convert-container";
export * from "./convert-container-arg";
export * from "./convert";
export * from "./idx";
export * from "./map";
export * from "./meta";
export * from "./nav";
export * from "./options";
export * from "./path";
export * from "./uuid";
export * from "./vector";
export * from "./words";
