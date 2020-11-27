/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Providing access to client instances.
 */

import { ClientUniverse } from "./universe";
import { CommsProto } from "../comms/proto";

/**
 * Class that knows about canvases.
 */
export class ClientProto {}

/**
 * Overload commsProto class.
 */
export interface ClientProto extends CommsProto {
	readonly universe: ClientUniverse;
}
