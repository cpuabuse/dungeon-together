/*
	File: src/app/render/screenable.ts
	cpuabuse.com
*/

import { Instanceable, InstanceUuid } from "../comms/interfaces";
import { Screen } from "./screen";

/**
 * Providing access to screens.
 */

/**
 * Class that knows about screens.
 */
export class Screenable {}

/**
 * Overload screenable class.
 */
export interface Screenable extends Instanceable {
	readonly instances: Map<InstanceUuid, Screen>;
}

// Setting readonly first time; Instances
(Screenable.prototype.instances as Map<InstanceUuid, Screen>) = new Map();

// Instance function
Screenable.prototype.getInstance = function(uuid: InstanceUuid) {
	return Screenable.prototype.instances.get(uuid);
};
