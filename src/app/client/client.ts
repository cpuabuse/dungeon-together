/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Client reality.
 */

import { BaseTexture, Texture } from "pixi.js";
import { InstanceArgs, InstancePath } from "../shared/comms/instance";
import { defaultInstanceUuid, defaultModeUuid } from "../common/defaults";
import { Canvas } from "./canvas";
import { Clientable } from "./clientable";
import { Grid } from "./grid";
import { LocusPath } from "../shared/comms/locus";
import { MappaPath } from "../shared/comms/mappa";
import { Mode } from "./mode";
import { OccupantPath } from "../shared/comms/occupant";
import { Pool } from "../shared/pool";
import { Scene } from "./scene";
import { Square } from "./square";
import { Uuid } from "../common/uuid";

/**
 * All instances in client.
 *
 * Termination of the client is impossible, because it is global.
 * For same reason [[Client]] does not store "defaultInstanceUuid" inside.
 */
export class Client implements Pool {
	/**
	 * Canvases.
	 *
	 * Should be treated as "readonly". Use "addInstance" and "removeInstance" methods instead.
	 * These methods are semantically different from similar of [[Canvas]], etc., as they are providing respective methods for the [[Client]] itself.
	 *
	 * The "getInstance", "getMappa", etc., are semantically different from above.
	 */
	public readonly instances: Map<Uuid, Canvas> = new Map();

	/**
	 * Modes.
	 */
	public modes: Map<Uuid, Mode> = new Map([
		[
			defaultModeUuid,
			{
				textures: [
					new Texture(new BaseTexture("img/bunny-red.svg")),
					new Texture(new BaseTexture("img/bunny-green.svg")),
					new Texture(new BaseTexture("img/bunny-blue.svg"))
				]
			}
		]
	]);

	/**
	 * Relations between modes and canvases.
	 */
	public modesIndex: Map<Uuid, Array<Uuid>> = new Map();

	/**
	 * Constructor.
	 */
	public constructor() {
		setTimeout(() => {
			this.addInstance({ instanceUuid: defaultInstanceUuid, mappas: new Map() });
		});
	}

	/**
	 * Add [[Canvas]] to [[Client]].
	 *
	 * Adds the modes from the instance.
	 */
	public addInstance(instance: InstanceArgs): void {
		if (this.instances.has(instance.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemoveInstance(instance);
		}

		// Set the instance and reset modes index
		let modesIndex: Array<Uuid> = new Array();
		let canvas: Canvas = new Canvas(instance);
		this.instances.set(canvas.instanceUuid, new Canvas(instance));
		this.modesIndex.set(instance.instanceUuid, modesIndex);

		// Populate the pool modes
		canvas.modes.forEach((mode, uuid) => {
			this.modes.set(uuid, mode);
			modesIndex.push(uuid);
		});
	}

	/**
	 * Remove [[Canvas]] from [[Client]].
	 *
	 * Removes unused modes.
	 */
	public doRemoveInstance({ instanceUuid }: InstancePath): void {
		// Checks if there is something to delete in the first place; Then within all the modes associated with the uuid of the instance to delete, we check that they are not within an array made up from all the other mode associations from "modesIndex" to other instances; And if there is no match, then we delete the mode; Finally we delete the instance and the "modesIndex" entry
		if (this.instances.has(instanceUuid)) {
			// Tell instance it is about to be deleted
			(this.instances.get(instanceUuid) as Canvas).terminate();

			// Clean up the modes
			if (this.modesIndex.has(instanceUuid)) {
				// Just checked if defined
				(this.modesIndex.get(instanceUuid) as Array<Uuid>).forEach(modeUuid => {
					if (
						!Array.from(this.modesIndex)
							.filter(function([key]) {
								return key !== instanceUuid;
							})
							.reduce(function(result, [, modesArray]) {
								return new Set([...Array.from(result), ...modesArray]);
							}, new Set())
							.has(modeUuid)
					) {
						this.modes.delete(modeUuid);
					}
				});

				// Actually remove the instance and modes index
				this.instances.delete(instanceUuid);
				this.modesIndex.delete(instanceUuid);
			}
		}
	}

	/**
	 * Get [[Canvas]].
	 *
	 * A shortcut function.
	 */
	public getInstance({ instanceUuid }: InstancePath): Canvas {
		let canvas: Canvas | undefined = this.instances.get(instanceUuid);

		if (canvas === undefined) {
			// "defaultInstanceUuid" is always present, since it is initialized and cannot be removed or overwritten
			return this.instances.get(defaultInstanceUuid) as Canvas;
		}
		return canvas;
	}

	/**
	 * Get [[Mode]].
	 *
	 * A shortcut function.
	 */
	public getMode({ uuid }: { uuid: Uuid }): Mode {
		let mode: Mode | undefined = this.modes.get(uuid);
		if (mode === undefined) {
			// Default mode is always there
			return this.modes.get(defaultModeUuid) as Mode;
		}
		return mode;
	}

	/**
	 * Get [[Square]].
	 *
	 * A shortcut function.
	 */
	public getLocus(path: LocusPath): Square {
		return this.getInstance(path)
			.getMappa(path)
			.getLocus(path);
	}

	/**
	 * Get [[Grid]].
	 *
	 * A shortcut function.
	 */
	public getMappa(path: MappaPath): Grid {
		return this.getInstance(path).getMappa(path);
	}

	/**
	 * Get [[Scene]].
	 *
	 * A shortcut function.
	 */
	public getOccupant(path: OccupantPath): Scene {
		return this.getInstance(path)
			.getMappa(path)
			.getLocus(path)
			.getOccupant(path);
	}

	/**
	 * Remove [[Canvas]] from [[Client]].
	 *
	 * Removes unused modes.
	 */
	public removeInstance(path: InstancePath): void {
		// Never remove "defaultInstanceUuid"
		if (path.instanceUuid === defaultInstanceUuid) {
			return;
		}
		this.doRemoveInstance(path);
	}
}

/**
 * Initialize the [[Client]].
 *
 * Timeouts in [[Client]] should be executed first.
 */
export async function InitClient(): Promise<void> {
	// Instances
	(Clientable.prototype.pool as Client) = new Client();
	return new Promise(function(resolve) {
		setTimeout(function() {
			resolve();
		});
	});
}

/**
 * Gets the [[Canvas]].
 *
 * @returns Canvas or default canvas
 */
export async function getCanvas(path: InstancePath): Promise<Canvas> {
	return Clientable.prototype.pool.getInstance(path);
}
