/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Defaults
 */

import { UrlOrigin, UrlPath } from "../../../../src/app/common/url";
import { Uuid, getDefaultUuid } from "../../../../src/app/common/uuid";

/**
 * Default system namespace path.
 */
export const defaultSystemNameSpace: UrlPath = "system";

/**
 * Default user namespace path.
 */
export const defaultUserNameSpace: UrlPath = "user";

/**
 * Default origin path.
 */
export const defaultOrigin: UrlOrigin = new URL("https://example.com/dt");

/**
 * Default ID path.
 */
export const defaultId: UrlPath = "test/id";

/**
 * Default shard path.
 */
export const defaultShardPath: UrlPath = `${defaultSystemNameSpace}/universe-objects/0`;

/**
 * Default grid path.
 */
export const defaultGridPath: UrlPath = `${defaultShardPath}/0`;

/**
 * Default cell path.
 */
export const defaultCellPath: UrlPath = `${defaultGridPath}/0`;

/**
 * Default shard UUID path.
 */
export const defaultShardUuid: Uuid = getDefaultUuid({
	origin: defaultOrigin,
	path: defaultShardPath
});

/**
 * Default grid UUID path.
 */
export const defaultGridUuid: Uuid = getDefaultUuid({
	origin: defaultOrigin,
	path: defaultGridPath
});

/**
 * Default cell UUID path.
 */
export const defaultCellUuid: Uuid = getDefaultUuid({
	origin: defaultOrigin,
	path: defaultCellPath
});
