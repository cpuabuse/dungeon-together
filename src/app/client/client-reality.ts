/*
	File: src/app/client/display-reality.ts
	cpuabuse.com
*/

/**
 * Client reality.
 */

import { InstanceUuid, Reality } from "../shared/interfaces";
import { Screen } from "./screen";

/**
 * All instances in client.
 */
export interface ClientReality extends Reality {
	instances: Map<InstanceUuid, Screen>;
}
