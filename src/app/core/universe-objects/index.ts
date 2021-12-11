/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Universe objects
 */

// Re-export
export { CoreUniverseObjectContainerFactory } from "./universe-object-container";
export { CoreUniverseObjectIds } from "./words";
export { CoreUniverseObjectArgsOptionsUnion, CoreUniverseObjectArgsContainer } from "./args";

/**
 * Default UUIDs are to be set by client/server universe objects, since they might be dependant on implementation. In core abstract class these members are abstract. Also, static method in a core abstract class should provide a default UUID.
 *
 * The universe object classes are to be abstract at core level, and concrete in client/server, so that client/server has more freedom in operating them. E.g. entity can be abstract class in server, with multiple concrete classes extending it, and client using a concrete entity class for all kinds of entities.
 *
 * @remarks
 * This is for documentation purposes only.
 */
export type CoreUniverseObjectInherit = never;
