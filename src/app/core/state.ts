/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { CoreTimer } from "./timer";

/**
 * @file File for common core state.
 */

/**
 * Base class with prototype per universe.
 *
 * Adding static method referencing prototype, thus class comes after interface for merging.
 */
/**
 * State for core.
 */
export class CoreState extends CoreTimer {}
