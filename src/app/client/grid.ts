/*
	File: src/app/render/vao.ts
	cpuabuse.com
*/

/**
 * Squares on screen.
 */

import { LocusArgs, LocusPath } from "../shared/comms/locus";
import { Mappa, MappaArgs } from "../shared/comms/mappa";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { defaultLocusVector, defaultWorldUuid, locusUuidUrlPath, urlPathSeparator } from "../common/defaults";
import { Clientable } from "./clientable";
import { Square } from "./square";

/**
 * Vector Array Object.
 */
export class Grid extends Clientable implements Mappa {
	/**
	 * UUID for default [[Grid]].
	 */
	public readonly defaultLocusUuid: Uuid;

	/**
	 * Instance path.
	 */
	public readonly instanceUuid: Uuid;

	/**
	 * Locations.
	 */
	public readonly locis: Map<Uuid, Square> = new Map();

	/**
	 * This id.
	 */
	public readonly mappaUuid: Uuid;

	/**
	 * Constructor.
	 */
	public constructor({ instanceUuid, locis, mappaUuid }: MappaArgs) {
		super();

		// Assign path
		this.instanceUuid = instanceUuid;
		this.mappaUuid = mappaUuid;

		// Set default Uuid
		this.instanceUuid = instanceUuid;
		this.defaultLocusUuid = getDefaultUuid({ path: `${locusUuidUrlPath}${urlPathSeparator}${this.mappaUuid}` });

		setTimeout(() => {
			// Set default locus
			this.addLocus({
				// Take path from this
				...this,
				locusUuid: this.defaultLocusUuid,
				occupants: new Map(),
				worlds: new Set([defaultWorldUuid]),
				...defaultLocusVector
			});

			locis.forEach(locus => {
				this.addLocus(locus);
			});
		});
	}

	/**
	 * Adds [[Locus]].
	 */
	public addLocus(locus: LocusArgs): void {
		if (this.locis.has(locus.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemoveSquare(locus);
		}
		this.locis.set(locus.locusUuid, new Square(locus));
	}

	/**
	 * Shortcut to get the [[Square]].
	 */
	public getLocus({ locusUuid }: LocusPath): Square {
		let square: Square | undefined = this.locis.get(locusUuid);
		// Default square is always there
		return square === undefined ? (this.locis.get(this.defaultLocusUuid) as Square) : square;
	}

	/**
	 * Removes the [[Square]]
	 * @param uuid UUID of the [[Square]]
	 */
	public removeLocus(path: LocusPath): void {
		if (path.locusUuid !== this.defaultLocusUuid) {
			this.doRemoveSquare(path);
		}
	}

	/**
	 * Performs the necessary cleanup when removed.
	 */
	public terminate(): void {
		this.locis.forEach(square => {
			this.doRemoveSquare(square);
		});
	}

	/**
	 * Actually remove the [[Square]] instance from "locis".
	 */
	private doRemoveSquare({ locusUuid }: LocusPath): void {
		let locus: Square | undefined = this.locis.get(locusUuid);
		if (locus !== undefined) {
			locus.terminate();
			this.locis.delete(locusUuid);
		}
	}
}
