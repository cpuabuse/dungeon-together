/*
	File: src/shared/comms/reality.ts
	cpuabuse.com
*/

/**
 * Shared reality.
 */

import { Instance, InstanceUuid } from "./interfaces";

/**
 * For objects existing as part of [[Reality]].
 */
export interface Instanceable {
	/**
	 * Gets the instance.
	 */
	getInstance(uuid: InstanceUuid): Instance | undefined;
}

/**
 * Lets other objects become [[Instanceable]].
 */
export interface Reality {
	/**
	 * Actual instances here.
	 */
	instances: Map<InstanceUuid, Instance>;

	/**
	 * Add instance to reality.
	 * @returns `true` on success, `false` on failure
	 */
	addInstance({ instance, uuid }: { instance: Instance; uuid: InstanceUuid }): boolean;

	/**
	 * Remove instance from reality.
	 * @returns `true` on success, `false` on failure
	 */
	removeInstance({ uuid }: { uuid: InstanceUuid }): boolean;
}
