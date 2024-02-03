/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Timer.
 *
 * @file
 */

/**
 * Timer.
 */
export class CoreTimer {
	/**
	 * Global timer.
	 */
	public static global: CoreTimer = new CoreTimer();

	/**
	 * Class creation time in milliseconds.
	 */
	protected readonly startTime: number = Date.now();

	/**
	 * Uptime.
	 *
	 * @returns Milliseconds since instance creation
	 */
	public get upTime(): number {
		return Date.now() - this.startTime;
	}

	/**
	 * Formatted uptime.
	 *
	 * @returns Formatted uptime
	 */
	public get upTimeMsWithDelta(): string {
		let { startTime }: CoreTimer = this;
		let delta: number = startTime - CoreTimer.global.startTime;
		return `${(Date.now() - startTime).toString()}${delta < 0 ? "" : "+"}${delta}ms`;
	}
}
