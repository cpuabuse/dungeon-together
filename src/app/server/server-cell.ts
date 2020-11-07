/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Cells making up the grid.
 */

import { Locus, LocusArgs, LocusPath } from "../shared/comms/locus";
import { Thing, ThingArgs } from "./thing";
import { Uuid, getDefaultUuid } from "../common/uuid";
import {
	defaultKindUuid,
	defaultModeUuid,
	defaultWorldUuid,
	navAmount,
	occupantUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { OccupantPath } from "../shared/comms/occupant";
import { Serverable } from "./serverable";

/**
 * Navigation.
 */
export type Nav = Array<LocusPath>;

/**
 * Arguments for the [[Place]] constructor.
 */
export interface PlaceArgs extends LocusArgs {
	nav: Nav;
	occupants: Map<Uuid, ThingArgs>;
}

/**
 * The cell within the grid.
 */
export class Place extends Serverable implements Locus {
	/**
	 * Default [[Thing]] UUID.
	 */
	public defaultOccupantUuid: Uuid;

	/**
	 * Parent universe.
	 */
	public readonly instanceUuid: Uuid;

	/**
	 * Mappa path.
	 */
	public readonly mappaUuid: Uuid;

	/**
	 * Navigation.
	 */
	public readonly nav: Nav = new Array(navAmount).fill(this);

	/**
	 * Place occupants.
	 */
	public readonly occupants: Map<Uuid, Thing> = new Map();

	/**
	 * Coordinates in map. An id given during creation. Does not represent anything visually or logically.
	 */
	public readonly locusUuid: string;

	/**
	 * Indicates which world this cell is part of.
	 */
	public worlds: Set<Uuid>;

	/**
	 * X represention.
	 */
	public x: number;

	/**
	 * Y represention.
	 */
	public y: number;

	/**
	 * Z represention.
	 */
	public z: number;

	/**
	 * Cell constructor.
	 *
	 * Creates nowhere by default.
	 * @param nav Can be less than [[navAmount]], then `this.nav` will be filled with `this`, if longer than [[navAmount]], then extra values will be ignored
	 */
	public constructor({ instanceUuid, locusUuid, mappaUuid, nav, occupants, worlds, x, y, z }: PlaceArgs) {
		// Serverable
		super();

		// Set path
		this.instanceUuid = instanceUuid;
		this.mappaUuid = mappaUuid;
		this.locusUuid = locusUuid;

		// Set coordinates
		this.x = x;
		this.y = y;
		this.z = z;

		// Set nav, but be gentle about the values we recieve
		for (let i: number = 0; i < navAmount && i < nav.length; i++) {
			this.nav[i] = nav[i];
		}

		// Initialize "defaultOccupantUuid"
		this.defaultOccupantUuid = getDefaultUuid({
			path: `${occupantUuidUrlPath}${urlPathSeparator}${this.locusUuid}`
		});

		// Set world; Generate a new object
		this.worlds = new Set([...worlds, defaultWorldUuid]);

		setTimeout(() => {
			// Set default occupant
			this.addOccupant({
				...this,
				kindUuid: defaultKindUuid,
				modeUuid: defaultModeUuid,
				occupantUuid: this.defaultOccupantUuid,
				worldUuid: defaultWorldUuid
			});

			// Initialize manifests
			this.worlds.forEach(worldUuid => {
				let {
					kinds
				}: {
					kinds: Set<Uuid>;
				} = this.pool.getWorld({
					uuid: worldUuid
				});

				kinds.forEach(kindUuid => {
					this.pool
						.getKind({
							uuid: kindUuid
						})
						.typeOfThing.initialize({
							...this,
							kindUuid,
							worldUuid
						});
				});
			});

			// Initialize things
			occupants.forEach(thing => {
				this.addOccupant(thing);
			});
		});
	}

	/**
	 * Adds [[Occupant]].
	 */
	public addOccupant(occupant: ThingArgs): void {
		if (this.occupants.has(occupant.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemoveThing(occupant);
		}
		let TypeOfThing: typeof Thing = this.pool.getKind({ uuid: occupant.kind }).typeOfThing;

		// The "TypeOfThing" will be classes extending "Thing", so abstract class should not be created
		// @ts-ignore
		new TypeOfThing({
			...occupant,
			instanceUuid: this.instanceUuid,
			locusUuid: this.locusUuid,
			mappaUuid: this.mappaUuid
		}).initialize();
	}

	/**
	 * Attach [[Thing]] to [[Locus]].
	 */
	public attach(thing: Thing): void {
		this.occupants.set(thing.occupantUuid, thing);
	}

	/**
	 * Detach [[Thing]] from [[Locus]].
	 */
	public detach({ occupantUuid }: Thing): void {
		if (this.occupants.has(occupantUuid)) {
			this.occupants.delete(occupantUuid);
		}
	}

	/**
	 * Gets [[Occupant]].
	 */
	public getOccupant({ occupantUuid }: OccupantPath): Thing {
		let thing: Thing | undefined = this.occupants.get(occupantUuid);
		// Default scene is always there
		return thing === undefined ? (this.occupants.get(this.defaultOccupantUuid) as Thing) : thing;
	}

	/**
	 * Removes [[Occupant]].
	 */
	public removeOccupant(path: OccupantPath): void {
		if (path.occupantUuid !== this.defaultOccupantUuid) {
			this.doRemoveThing(path);
		}
	}

	/**
	 * Terminate `this`.
	 */
	public terminate(): void {
		this.occupants.forEach(thing => {
			this.doRemoveThing(thing);
		});
	}

	/**
	 * Actually removes [[Occupant]].
	 */
	private doRemoveThing({ occupantUuid }: OccupantPath): void {
		let thing: Thing | undefined = this.occupants.get(occupantUuid);
		if (thing !== undefined) {
			thing.terminate();
		}
	}
}
