/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Providing access to server resources.
 */

import { CommsProto } from "../comms/proto";
import { ServerUniverse } from "./universe";

/**
 * Class that knows about shards.
 */
export class ServerProto {}

/**
 * Overload commsProto class.
 */
export interface ServerProto extends CommsProto {
	readonly universe: ServerUniverse;
}
