/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Generic arguments option definition.
 */

import { ArgsOptionsImplements } from "../comms/args";

/**
 * Args options for server.
 */
export interface ServerArgsOptions extends ArgsOptionsImplements<ServerArgsOptions> {
	/**
	 * Navigation.
	 */
	nav: true;
}
