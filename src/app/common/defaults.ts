/*
	Copyright 2020 cpuabuse.com
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
export const appUrl: string = "https://cpuabuse.com";

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
 * Instance path identifier for UUID.
 */
export const instanceUuidUrlPath: string = "instance";

/**
 * Kind path identifier for UUID.
 */
export const kindUuidUrlPath: string = "kind";

/**
 * Locus path identifier for UUID.
 */
export const locusUuidUrlPath: string = "locus";

/**
 * Mappa path identifier for UUID.
 */
export const mappaUuidUrlPath: string = "mappa";

/**
 * Mode path identifier for UUID.
 */
export const modeUuidUrlPath: string = "mode";

/**
 * Occupant path identifier for UUID.
 */
export const occupantUuidUrlPath: string = "occupant";

/**
 * World path identifier for UUID.
 */
export const worldUuidUrlPath: string = "world";

/**
 * Default instance UUID.
 */
export const defaultInstanceUuid: Uuid = getDefaultUuid({
	path: `${instanceUuidUrlPath}${urlPathSeparator}${defaultUuidUrlKeyword}`
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
 * Default mobile scene height.
 */
export const defaultMobileSceneHeight: number = 100;

/**
 * Default mobile scene width.
 */
export const defaultMobileSceneWidth: number = 100;

/**
 * Default scene height.
 */
export const defaultSceneHeight: number = 50;

/**
 * Default scene width.
 */
export const defaultSceneWidth: number = 50;

/**
 * Minimum number of scenes to fit in row in canvas.
 */
export const defaultMinimumScenesInColumn: number = 12;

/**
 * Minimum number of scenes to fit in column in canvas.
 */
export const defaultMinimumScenesInRow: number = 12;

/**
 * Default vector for default locuses.
 */
export const defaultLocusVector: Vector = { x: 0, y: 0, z: 0 };

// Current navigation
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
