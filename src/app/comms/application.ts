/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file File for application with a shared state.
 */

import { CoreState } from "./state";

/**
 * An application, to be extended.
 */
export class Application {
	/**
	 * Shared universe state.
	 */
	protected static state: CoreState = new CoreState();
}
