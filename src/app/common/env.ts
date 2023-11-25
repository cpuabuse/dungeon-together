/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Environment variables.
 *
 * @file
 */

// Defininf Vite injections
/* eslint-disable no-underscore-dangle */
/**
 * Path to root directory.
 */
declare const __VITE_DEFINE_PATH_TO_ROOT__: string;
/* eslint-enable no-underscore-dangle */

/**
 * Type to define Vite injections.
 */
export type ViteDefine = {
	/**
	 * Path to root directory.
	 */
	__VITE_DEFINE_PATH_TO_ROOT__: typeof __VITE_DEFINE_PATH_TO_ROOT__;
};

/**
 * Environment variables, accessible by application.
 */
// Infer types
// eslint-disable-next-line @typescript-eslint/typedef
export const env = {
	pathToRoot: __VITE_DEFINE_PATH_TO_ROOT__
};
