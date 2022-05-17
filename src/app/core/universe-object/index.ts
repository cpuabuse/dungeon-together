/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe objects
 */

// Re-export
export * from "./universe-objects-container";
export * from "./options";
export * from "./universe-object";
export * from "./universe";
export * from "./parameters";

/**
 * Default UUIDs are to be set by client/server universe objects, since they might be dependant on implementation. In core abstract class these members are abstract. Also, static method in a core abstract class should provide a default UUID.
 *
 * The universe object classes are to be abstract at core level, and concrete in client/server, so that client/server has more freedom in operating them. E.g. entity can be abstract class in server, with multiple concrete classes extending it, and client using a concrete entity class for all kinds of entities.
 *
 * The member type inference is done for verification that exported types match actual output of the class factory function, as such no verification is done for the static class members, as no class type is exported.
 *
 * Universe object factory needs to work with special logic for maintaining base constructor information, while container does not, as it can extend base class directly.
 *
 * - `extends class extends Base { }` is to silence TS, not to actually add class to chain. Should watch closely over given super params, as they become any.
 *
 * @remarks
 * This is for documentation purposes only.
 */
export type CoreUniverseObjectInherit = never;
