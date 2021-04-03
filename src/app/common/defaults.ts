/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Defaults.
 */

import { Uuid, getDefaultUuid } from "./uuid";
import { Vector } from "./vector";

/**
 * App namespace.
 */
export const appUrl: string = "https://cpuabuse.com/dt";

/**
 * Default URL for a server.
 */
export const defaultServerUrl: string = "http://localhost:80";

/**
 * Separator between the entries of the path.
 */
export const urlPathSeparator: string = "/";

/**
 * Keyword for default UUID URLs.
 */
export const defaultUuidUrlKeyword: string = "default";

/**
 * Shard path identifier for UUID.
 */
export const shardUuidUrlPath: string = "shard";

/**
 * Kind path identifier for UUID.
 */
export const kindUuidUrlPath: string = "kind";

/**
 * CommsCell path identifier for UUID.
 */
export const cellUuidUrlPath: string = "cell";

/**
 * CommsGrid path identifier for UUID.
 */
export const gridUuidUrlPath: string = "grid";

/**
 * Mode path identifier for UUID.
 */
export const modeUuidUrlPath: string = "mode";

/**
 * CommsEntity path identifier for UUID.
 */
export const entityUuidUrlPath: string = "entity";

/**
 * World path identifier for UUID.
 */
export const worldUuidUrlPath: string = "world";

/**
 * Default instance UUID.
 */
export const defaultShardUuid: Uuid = getDefaultUuid({
	path: `${shardUuidUrlPath}${urlPathSeparator}${defaultUuidUrlKeyword}`
});

/**
 * Default kind UUID.
 */
export const defaultKindUuid: Uuid = getDefaultUuid({
	path: `${kindUuidUrlPath}${urlPathSeparator}${defaultUuidUrlKeyword}`
});

/**
 * Default mode UUID.
 */
export const defaultModeUuid: Uuid = getDefaultUuid({
	path: `${modeUuidUrlPath}${urlPathSeparator}${defaultUuidUrlKeyword}`
});

/**
 * Default world.
 */
export const defaultWorldUuid: Uuid = getDefaultUuid({
	path: `${worldUuidUrlPath}${urlPathSeparator}${defaultUuidUrlKeyword}`
});

/**
 * Default mobile entity height.
 */
export const defaultMobileEntityHeight: number = 100;

/**
 * Default mobile entity width.
 */
export const defaultMobileEntityWidth: number = 100;

/**
 * Default entity height.
 */
export const defaultEntityHeight: number = 50;

/**
 * Default entity width.
 */
export const defaultEntityWidth: number = 50;

/**
 * Minimum number of entity to fit in row in canvas.
 */
export const defaultMinimumEntityInColumn: number = 15;

/**
 * Minimum number of entities to fit in column in clientShard.
 */
export const defaultMinimumEntityInRow: number = 15;

/**
 * Default vector for default cells.
 */
export const defaultCellVector: Vector = { x: 0, y: 0, z: 0 };

// Current navigation
/**
 *
 */
let currentNav: number = 0;

/**
 * Down movement.
 */
export const bottom: number = currentNav++;

/**
 * Down-left movement.
 */
export const bottomLeft: number = currentNav++;

/**
 * Down-right movement.
 */
export const bottomRight: number = currentNav++;

/**
 * Left movement.
 */
export const left: number = currentNav++;

/**
 * Right movement.
 */
export const right: number = currentNav++;

/**
 * Up movement.
 */
export const top: number = currentNav++;

/**
 * Up-left movement.
 */
export const topLeft: number = currentNav++;

/**
 * Up-right movement.
 */
export const topRight: number = currentNav++;

/**
 * Vertical down movement.
 */
export const zDown: number = currentNav++;

/**
 * zDown-bottom movement.
 */
export const zDownBottom: number = currentNav++;

/**
 * zDown-bottom-left movement.
 */
export const zDownBottomLeft: number = currentNav++;

/**
 * zDown-bottom-right movement.
 */
export const zDownBottomRight: number = currentNav++;

/**
 * zDown-left movement.
 */
export const zDownLeft: number = currentNav++;

/**
 * zDown-right movement.
 */
export const zDownRight: number = currentNav++;

/**
 * zDown-top movement.
 */
export const zDownTop: number = currentNav++;

/**
 * zDown-left movement.
 */
export const zDownTopLeft: number = currentNav++;

/**
 * zDown-top-right movement.
 */
export const zDownTopRight: number = currentNav++;

/**
 * Vertical up movement.
 */
export const zUp: number = currentNav++;

/**
 * zUp-bottom-left movement.
 */
export const zUpBottomLeft: number = currentNav++;

/**
 * zUp-bottom-right movement.
 */
export const zUpBottomRight: number = currentNav++;

/**
 * zUp-left movement.
 */
export const zUpLeft: number = currentNav++;

/**
 * zUp-right movement.
 */
export const zUpRight: number = currentNav++;

/**
 * zUp-top movement.
 */
export const zUpTop: number = currentNav++;

/**
 * zUp-left movement.
 */
export const zUpTopLeft: number = currentNav++;

/**
 * zUp-right movement.
 */
export const zUpTopRight: number = currentNav++;

/**
 * Total amount of navigation entries.
 */
export const navAmount: number = currentNav;
