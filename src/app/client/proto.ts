/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Providing access to client universe objects.
 */

import { CommsProto } from "../comms/proto";
import { ClientUniverse } from "./universe";

/**
 * Class that knows about canvases.
 */
export class ClientProto {}

/**
 * Overload commsProto class.
 */
export interface ClientProto extends CommsProto {
	/**
	 *
	 */
	universe: ClientUniverse;

	/**
	 *
	 */
	element: HTMLElement;
}
