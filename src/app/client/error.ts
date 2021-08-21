/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Error processing in client
 */

// A lot of console for error reports
/* eslint-disable no-console */

import { hasOwnProperty } from "../common/utility-types";

/**
 * Log level.
 */
export enum LogLevel {
	Info,
	Warning,
	Error
}

/**
 * Single error argument for error processing.
 */
export type SingleErrorArgs = {
	/**
	 * Error.
	 */
	error: Error;
};

/**
 * Handles logging.
 *
 * {@link ErroringReturnError} should be used as an argument.
 *
 * @param arg - Error or errors and log level
 */
export function processLog(
	arg: {
		/**
		 * Log level.
		 */
		level: LogLevel;
	} & (
		| {
				/**
				 * Error.
				 */
				error: Error;
		  }
		| {
				/**
				 * Error array.
				 */
				errors: Array<Error>;
		  }
	)
): void {
	if (hasOwnProperty(arg, "error" as const)) {
		if (arg.level > LogLevel.Warning) {
			console.error(arg.error);
		} else {
			console.log(arg.error);
		}
	} else {
		arg.errors.forEach(error => {
			if (arg.level > LogLevel.Warning) {
				console.error(error);
			} else {
				console.log(error);
			}
		});
	}
}
