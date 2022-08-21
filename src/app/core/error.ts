/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Error processing in client
 */

import { Chalk, ChalkInstance } from "chalk";
import { Logger, noConflict } from "loglevel";
import { HexColors } from "../common/color";
import { CoreTimer } from "./timer";

/**
 * Log parameter.
 */
type LogParam = {
	/**
	 * Error.
	 */
	error?: Error;

	/**
	 * Optional message.
	 */
	message?: string;
};

/**
 * Log level.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc5424#section-6.2.1}
 */
export enum LogLevel {
	/**
	 * System is unusable.
	 *
	 * @remarks
	 * Example: Corrupt data prevents creating connections. Cannot recover.
	 */
	Emergency,

	/**
	 * Action must be taken immediately.
	 *
	 * @remarks
	 * Example: Graphical context not initialized. Reload required.
	 */
	Alert,

	/**
	 * Critical conditions.
	 *
	 * @remarks
	 * Example: Server connection lost. Connection will attempt to reestablish.
	 */
	Critical,

	/**
	 * Error conditions.
	 *
	 * @remarks
	 * Example: Inconsistent data, leading to display of wrong sprite. Does not affect operation of other aspects of the system.
	 */
	Error,

	/**
	 * Warning conditions.
	 *
	 * @remarks
	 * Example: Default object could not be initialized, which could lead to potential instability.
	 */
	Warning,

	/**
	 *  Normal but significant condition.
	 *
	 * @remarks
	 * Example: Method execution took too long. Does not impact system operation.
	 */
	Notice,

	/**
	 * Informational messages.
	 *
	 * @remarks
	 * Example: Method execution started. Operation as expected.
	 */
	Informational,

	/**
	 * Debug-level messages.
	 *
	 * @remarks
	 * Example: Data output to console. Designed only for testing.
	 */
	Debug
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
 * Core logger.
 */
type CoreLogger = (param: {
	/**
	 * Messages to print.
	 */
	messages: Array<any>;
}) => void;

/**
 * Core Log.
 */
export class CoreLog {
	public timer: CoreTimer;

	/**
	 * Creating `chalk` instance.
	 *
	 * @remarks
	 * Does not seem to detect color level correctly in Chrome/Edge, thus setting it to TrueColor.
	 */
	protected static chalk: ChalkInstance = new Chalk({ level: 3 });

	/**
	 * Logger to log.
	 *
	 * @remarks
	 * `noConflict` does not modify global scope.
	 */
	protected static logger: Logger = ((): Logger => {
		let logger: Logger = noConflict() as Logger;
		logger.enableAll();

		return logger;
	})();

	/**
	 * Global log, should be used when universe unknown.
	 */
	// Should be initialized last, as singleton
	// eslint-disable-next-line @typescript-eslint/member-ordering
	public static global: CoreLog = new CoreLog({ source: "Core", timer: CoreTimer.global });

	/**
	 * Loggers to log with.
	 *
	 * @remarks
	 * `LogLevel extends Key` checks for exhaustiveness.
	 */
	protected loggers: Record<LogLevel, CoreLogger> = (
		Object.entries as <Key extends LogLevel, T>(
			...arg: [Record<Key, T>]
		) => LogLevel extends Key ? Array<[Key, T]> : never
	)({
		[LogLevel.Emergency]: {
			method: "error" as const,
			transformer: (this.constructor as typeof CoreLog).chalk.bgHex(HexColors.Red).hex(HexColors.Yellow).bold
		},
		[LogLevel.Alert]: {
			method: "error" as const,
			transformer: (this.constructor as typeof CoreLog).chalk.bgHex(HexColors.Red).hex(HexColors.Yellow)
		},
		[LogLevel.Critical]: {
			method: "error" as const,
			transformer: (this.constructor as typeof CoreLog).chalk.bgHex(HexColors.Red).hex(HexColors.White).bold
		},
		[LogLevel.Error]: {
			method: "error" as const,
			transformer: (this.constructor as typeof CoreLog).chalk.bgHex(HexColors.Red).hex(HexColors.White)
		},
		[LogLevel.Warning]: {
			method: "warn" as const,
			transformer: (this.constructor as typeof CoreLog).chalk.bgHex(HexColors.Orange).hex(HexColors.White)
		},
		[LogLevel.Notice]: { method: "info" as const, transformer: (this.constructor as typeof CoreLog).chalk.bold },
		[LogLevel.Informational]: { method: "info" as const, transformer: (this.constructor as typeof CoreLog).chalk },
		[LogLevel.Debug]: { method: "debug" as const, transformer: (this.constructor as typeof CoreLog).chalk.italic }
	}).reduce(
		// ESLint destructure bug
		// eslint-disable-next-line @typescript-eslint/typedef
		(result, [level, { transformer, method }]) => {
			return {
				...result,
				/**
				 * Prints messages.
				 *
				 * @param param - Destructured parameter
				 * @remarks
				 * `chalk` seems to work well only for first message.
				 */
				[level]: ({ messages }: Parameters<CoreLogger>[0]) => {
					(this.constructor as typeof CoreLog).logger[method](
						`[${transformer(LogLevel[level])}]`,
						`[${this.timer.upTime}ms]`,
						`[${this.source}]`,
						// Spread of `any`
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						...messages
					);
				}
				// Cast, since `string` index
			} as Record<LogLevel, CoreLogger>;
		},
		{} as Record<LogLevel, CoreLogger>
	);

	/* eslint-enable @typescript-eslint/member-ordering */

	protected source: string;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		source,
		timer
	}: {
		/**
		 * Source identifier (CamelCase).
		 */
		source: string;

		/**
		 * Timer.
		 */
		timer: CoreTimer;
	}) {
		this.source = source;
		this.timer = timer;

		// #if _DEBUG_ENABLED
		// Determine if singleton
		// ESLint bug
		// eslint-disable-next-line @typescript-eslint/typedef
		if (!(this.constructor as typeof CoreLog).global) {
			Object.values(this.loggers).forEach((logger, level) => {
				logger({
					messages: [`Testing logging for "${LogLevel[level]}" level...`]
				});
			});
		}
		// #endif
		// #endregion
	}

	/**
	 * Handles logging.
	 *
	 * {@link ErroringReturnError} should be used as an argument.
	 *
	 * @remarks
	 * Logging should happen, if error is not passed further, and is silenced one way or another.
	 *
	 * - Using `debug`, `info`, `error` and `warn` provided by library. `trace` is not used, as it does not represent severity
	 * - When universe is not properly initialized or `this` is not bound, should still produce global errors, but it is preferred for this class to be part of universe still
	 *
	 * @param arg - Error or errors and log level
	 */
	public log({
		error,
		level = LogLevel.Informational,
		message,

		/* eslint-disable prettier/prettier */
		// #if _DEBUG_ENABLED
		data
		// #endif
	}: {
		/* eslint-enable prettier/prettier */
		/**
		 * Log level.
		 */
		level: LogLevel;

		// #if _DEBUG_ENABLED
		/**
		 * Extra data to display.
		 * Should be provided only in debug mode.
		 */
		data?: unknown;
		// #endif
	} & LogParam &
		(Required<Pick<LogParam, "error">> | Required<Pick<LogParam, "message">>)): void {
		let messages: Array<any> = new Array();
		if (message) {
			messages.push(message);
		}
		if (error) {
			messages.push(error);
		}
		// #if _DEBUG_ENABLED
		if (data) {
			messages.push(data);
		}
		// #endif

		this.loggers[level]({ messages });
	}
}
