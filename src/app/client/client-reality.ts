/*
	File: src/app/client/display-reality.ts
	cpuabuse.com
*/

/**
 * Client reality.
 */

import { InstanceUuid } from "../shared/comms/uuid";
import { Reality } from "../shared/reality";
import { Screen } from "./screen";

/**
 * All instances in client.
 */
export interface ClientReality extends Reality {
	instances: Map<InstanceUuid, Screen>;
}
