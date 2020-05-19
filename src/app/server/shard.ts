/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * A universe with everything.
 */

import { Area, AreaArgs } from "./area";
import { Instance, InstanceArgs } from "../shared/comms/instance";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { mappaUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { ClientConnection } from "../client/connection";
import { MappaPath } from "../shared/comms/mappa";
import { ServerConnection } from "./connection";
import { Serverable } from "./serverable";

/**
 * Universe args.
 */
export interface ShardArgs extends InstanceArgs {
	mappas: Map<Uuid, AreaArgs>;
}

/**
 * A whole universe.
 */
export class Shard extends Serverable implements Instance {
	/**
	 * Connection to client.
	 */
	public connection: Map<Uuid, ServerConnection> = new Map();

	/**
	 * Default [[Area]] UUID.
	 */
	public defaultMappaUuid: Uuid;

	/**
	 * This UUID.
	 */
	public instanceUuid: Uuid;

	/**
	 * Grids of the universe.
	 */
	public mappas: Map<Uuid, Area> = new Map();

	/**
	 * Constructor.
	 */
	public constructor({ instanceUuid, mappas }: ShardArgs) {
		// Serverable
		super();

		// Set path
		this.instanceUuid = instanceUuid;

		// Deal with default
		this.defaultMappaUuid = getDefaultUuid({
			path: `${mappaUuidUrlPath}${urlPathSeparator}${this.instanceUuid}`
		});
		setTimeout(() => {
			this.addMappa({ ...this, locis: new Map(), mappaUuid: this.defaultMappaUuid });

			mappas.forEach(area => {
				this.addMappa(area);
			});
		});
	}

	/**
	 * Add a connection.
	 */
	public addConnection({
		canvasUuid,
		connection,
		standalone
	}: {
		canvasUuid: Uuid;
		connection: WebSocket | ClientConnection;
		standalone?: boolean;
	}): ServerConnection {
		if (this.connection.has(canvasUuid)) {
			(this.connection.get(canvasUuid) as ServerConnection).terminate();
		}
		let serverConnection: ServerConnection = new ServerConnection({
			canvasUuid,
			connection,
			shard: this,
			standalone
		});
		this.connection.set(canvasUuid, serverConnection);
		return serverConnection;
	}

	/**
	 * Adds [[Area]].
	 */
	public addMappa(mappa: AreaArgs): void {
		if (this.mappas.has(mappa.mappaUuid)) {
			// Clear the instance if it already exists
			this.doRemoveArea(mappa);
		}
		this.mappas.set(mappa.mappaUuid, new Area(mappa));
	}

	/**
	 * Gets [[Mappa]].
	 */
	public getMappa({ mappaUuid }: MappaPath): Area {
		let area: Area | undefined = this.mappas.get(mappaUuid);
		if (area === undefined) {
			// The default is always preserved
			return this.mappas.get(this.defaultMappaUuid) as Area;
		}
		return area;
	}

	/**
	 * Removes [[Mappa]].
	 */
	public removeMappa(path: MappaPath): void {
		if (path.mappaUuid !== this.defaultMappaUuid) {
			this.doRemoveArea(path);
		}
	}

	/**
	 * Terminates `this`.
	 */
	public terminate(): void {
		this.mappas.forEach(function (area) {
			area.terminate();
		});
	}

	/**
	 * Actual removes [[Place]]
	 */
	private doRemoveArea({ mappaUuid }: MappaPath): void {
		let area: Area | undefined = this.mappas.get(mappaUuid);
		if (area !== undefined) {
			area.terminate();
			this.mappas.delete(mappaUuid);
		}
	}
}
