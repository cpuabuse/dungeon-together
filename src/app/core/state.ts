/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

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
export class CoreState {
	/**
	 * Uptime.
	 *
	 * @returns Milliseconds since class creation.
	 */
	public get upTime(): number {
		return Date.now() - this.startTime;
	}

	/**
	 * Class creation time in milliseconds.
	 */
	private readonly startTime: number = Date.now();
}
