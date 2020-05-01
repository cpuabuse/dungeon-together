/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Grid for the dungeons.
 */

import { Mappa, MappaArgs } from "../shared/comms/mappa";
import { Place, PlaceArgs } from "./place";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { defaultLocusVector, locusUuidUrlPath, navAmount, urlPathSeparator } from "../common/defaults";
import { LocusPath } from "../shared/comms/locus";
import { Serverable } from "./serverable";

/**
 * Arguments for the [[Area]].
 */
export interface AreaArgs extends MappaArgs {
	locis: Map<Uuid, PlaceArgs>;
}

/**
 * The grid itself.
 */
export class Area extends Serverable implements Mappa {
	/**
	 * Default [[Thing]] UUID.
	 */
	public defaultLocusUuid: Uuid;

	/**
	 * Parent universe.
	 */
	public readonly instanceUuid: Uuid;

	/**
	 * Actual cells inside of the grid.
	 */
	public locis: Map<Uuid, Place> = new Map();

	/**
	 * Mappa path.
	 */
	public readonly mappaUuid: Uuid;

	/**
	 * Initializes the grid.
	 * @param worlds The default world will be ignored, as it is already present by default.
	 */
	public constructor({ instanceUuid, locis, mappaUuid }: AreaArgs) {
		// Serverable
		super();

		// Set path
		this.instanceUuid = instanceUuid;
		this.mappaUuid = mappaUuid;

		// Generate default
		this.defaultLocusUuid = getDefaultUuid({
			path: `${locusUuidUrlPath}${urlPathSeparator}${this.instanceUuid}`
		});

		setTimeout(() => {
			this.addLocus({
				...this,
				locusUuid: this.defaultLocusUuid,
				nav: new Array(navAmount).fill(this.defaultLocusUuid),
				occupants: new Map(),
				worlds: new Set(),
				...defaultLocusVector
			});

			// Create cells
			locis.forEach(place => {
				this.addLocus(place);
			});
		});
	}

	/**
	 * Adds [[Place]].
	 */
	public addLocus(locus: PlaceArgs): void {
		if (this.locis.has(locus.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemovePlace(locus);
		}
		this.locis.set(locus.locusUuid, new Place(locus));
	}

	/**
	 * Gets [[Place]].
	 */
	public getLocus({ locusUuid }: LocusPath): Place {
		let place: Place | undefined = this.locis.get(locusUuid);
		if (place === undefined) {
			// The default is always preserved
			return this.locis.get(this.defaultLocusUuid) as Place;
		}
		return place;
	}

	/**
	 * Removes [[Place]].
	 */
	public removeLocus(path: LocusPath): void {
		if (path.locusUuid !== this.defaultLocusUuid) {
			this.doRemovePlace(path);
		}
	}

	/**
	 * Terminates `this`.
	 */
	public terminate(): void {
		this.locis.forEach(function(place) {
			place.terminate();
		});
	}

	/**
	 * Actual removes [[Place]]
	 */
	private doRemovePlace({ locusUuid }: LocusPath): void {
		let place: Place | undefined = this.locis.get(locusUuid);
		if (place !== undefined) {
			place.terminate();
			this.locis.delete(locusUuid);
		}
	}
}
