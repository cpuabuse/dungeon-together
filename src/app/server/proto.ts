/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Providing access to server resources.
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
	/**
	 * Server universe reference.
	 */
	universe: ServerUniverse;
}
