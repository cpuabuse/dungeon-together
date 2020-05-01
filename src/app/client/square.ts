/*
	File: src/app/render/square.ts
	cpuabuse.com
*/

/**
 * Squares on screen.
 */

import { Locus, LocusArgs } from "../shared/comms/locus";
import { OccupantArgs, OccupantPath } from "../shared/comms/occupant";
import { Uuid, getDefaultUuid } from "../common/uuid";
import {
	defaultKindUuid,
	defaultModeUuid,
	defaultWorldUuid,
	occupantUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { Clientable } from "./clientable";
import { Scene } from "./scene";

/**
 * Square(Vector).
 */
export class Square extends Clientable implements Locus {
	/**
	 * UUID for default [[Scene]].
	 */
	public readonly defaultOccupantUuid: Uuid;

	/**
	 * Instance path.
	 */
	public readonly instanceUuid: Uuid;

	/**
	 * This locus UUID.
	 */
	public readonly locusUuid: Uuid;

	/**
	 * This id.
	 */
	public readonly mappaUuid: Uuid;

	/**
	 * Contents of square.
	 */
	public readonly occupants: Map<Uuid, Scene> = new Map();

	/**
	 * Worlds of this.
	 */
	public worlds: Set<Uuid> = new Set();

	/**
	 * X coordinate.
	 */
	public x: number;

	/**
	 * Y coordinate.
	 */
	public y: number;

	/**
	 * Z coordinate.
	 */
	public z: number;

	/**
	 * Constructs square.
	 */
	public constructor({ instanceUuid, locusUuid, mappaUuid, occupants, x, y, z }: LocusArgs) {
		super();

		// Initialize path
		this.instanceUuid = instanceUuid;
		this.locusUuid = locusUuid;
		this.mappaUuid = mappaUuid;

		// Initialize coordinates
		this.x = x;
		this.y = y;
		this.z = z;

		// Set default Uuid
		this.instanceUuid = instanceUuid;
		this.defaultOccupantUuid = getDefaultUuid({
			path: `${occupantUuidUrlPath}${urlPathSeparator}${this.locusUuid}`
		});

		setTimeout(() => {
			// Populate with default [[Scene]]
			this.addOccupant({
				// Take path from this
				...this,
				kindUuid: defaultKindUuid,
				modeUuid: defaultModeUuid,
				occupantUuid: this.defaultOccupantUuid,
				worldUuid: defaultWorldUuid
			});

			// Fill occupants
			occupants.forEach(occupant => {
				this.occupants.set(occupant.occupantUuid, new Scene(occupant));
			});
		});
	}

	/**
	 * Adds [[Occupant]].
	 */
	public addOccupant(occupant: OccupantArgs): void {
		if (this.occupants.has(occupant.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemoveScene(occupant);
		}
		// It does not perform the check for "sceneUuid" because there is no default
		this.occupants.set(occupant.occupantUuid, new Scene(occupant));
	}

	/**
	 * Shortcut to get the [[Scene]].
	 */
	public getOccupant({ occupantUuid }: OccupantPath): Scene {
		let scene: Scene | undefined = this.occupants.get(occupantUuid);
		// Default scene is always there
		return scene === undefined ? (this.occupants.get(this.defaultOccupantUuid) as Scene) : scene;
	}

	/**
	 * Actually remove the [[Scene]] instance from "square".
	 *
	 * Unlike other clientables, this function does not use "doRemoveScene", because there is no default scene.
	 */
	public removeOccupant(path: OccupantPath): void {
		if (path.occupantUuid !== this.defaultOccupantUuid) {
			this.doRemoveScene(path);
		}
	}

	/**
	 * Terminates the [[Scene]].
	 */
	public terminate(): void {
		this.occupants.forEach(scene => {
			this.removeOccupant(scene);
		});
	}

	/**
	 * Actually removes the occupant.
	 */
	private doRemoveScene({ occupantUuid }: OccupantPath): void {
		let scene: Scene | undefined = this.occupants.get(occupantUuid);
		if (scene !== undefined) {
			scene.terminate();
			this.occupants.delete(occupantUuid);
		}
	}
}
