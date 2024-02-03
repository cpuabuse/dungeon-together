/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file For managing internal paths
 */

/**
 * A separator for URL.
 */
// Inferring literal
// eslint-disable-next-line @typescript-eslint/typedef
export const separator = "/" as const;

/**
 * Type for a URL.
 */
export type UrlPath = string;

/**
 * Origin for URL.
 */
export type UrlOrigin = URL;
