/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Occupant of cells.
 */

import { Occupant, OccupantArgs, OccupantPath } from "../shared/comms/occupant";
import { LocusPath } from "../shared/comms/locus";
import { Place } from "./place";
import { Serverable } from "./serverable";
import { Uuid } from "../common/uuid";
import { defaultModeUuid } from "../common/defaults";

/**
 * Arguments for constructor of a thing.
 */
export interface InitializeArgs extends LocusPath {
	/**
	 * Kind of thing in world.
	 */
	kindUuid: Uuid;

	/**
	 * The whole world
	 */
	worldUuid: Uuid;
}

/**
 * Arguments for a [[Thing]].
 */
export interface ThingArgs extends OccupantArgs {
	[key: string]: any;
}

/**
 * The thing itself. Can be anything that resides within the [[Cell]].
 *
 * It is a responsibility of the classes extending [[Thing]] to perform consistency checks on the arguments, thus the default values should always be provided.
 *
 * There are 2 ways to create a [[Thing]]:
 *
 * // TODO: Add ways to create a thing
 */
export abstract class Thing extends Serverable implements Occupant {
	/**
	 * Kind of this thing in the world.
	 */
	public kindUuid: Uuid;

	/**
	 * Mode of the thing.
	 */
	public modeUuid: string = defaultModeUuid;

	/**
	 * Cell occupied by the thing.
	 */
	public locusUuid: Uuid;

	/**
	 * Universe this resides in.
	 */
	public instanceUuid: Uuid;

	/**
	 * Corresponding mappa.
	 */
	public mappaUuid: Uuid;

	/**
	 * This UUID.
	 */
	public occupantUuid: Uuid;

	/**
	 * World this is in.
	 */
	public worldUuid: Uuid;

	/**
	 * Constructor.
	 */
	public constructor({ instanceUuid, kindUuid, locusUuid, mappaUuid, occupantUuid, worldUuid }: ThingArgs) {
		// Serverable
		super();

		// Set path
		this.instanceUuid = instanceUuid;
		this.mappaUuid = mappaUuid;
		this.locusUuid = locusUuid;
		this.occupantUuid = occupantUuid;

		// Set kind & world
		this.kindUuid = kindUuid;
		this.worldUuid = worldUuid;
	}

	/**
	 * Initializes the cell's things.
	 */
	public static initialize(
		// Fix the linting errors; This method is defined to provide type
		// eslint-disable-next-line no-empty-pattern
		{}: InitializeArgs
	): void {
		// Do nothing
	}

	/**
	 * Initializes the [[Thing]] into the `Place`.
	 *
	 * To be called from `Place`.
	 */
	public initialize(): void {
		this.doInitialize();
		this.pool.getLocus(this).attach(this);
	}

	/**
	 * Move.
	 */
	public move(locusPath: LocusPath): void {
		this.performMove(locusPath);
	}

	/**
	 * Move.
	 */
	public swap(occupantPath: OccupantPath): void {
		let thing: Thing = this.pool.getOccupant(occupantPath);
		if (thing.kindUuid === this.kindUuid && thing.worldUuid === this.worldUuid) {
			this.performSwap(occupantPath);
		}
	}

	/**
	 * Terminates the [[Thing]].
	 */
	public terminate(): void {
		this.pool.getLocus(this).detach(this);
		this.doTerminate();
	}

	/**
	 * Actually moves the thing.
	 */
	protected doMove(locusPath: LocusPath): void {
		// Get place for accurate UUIDs
		let place: Place = this.pool.getLocus(locusPath);

		// Reattach
		this.pool.getLocus(this).detach(this);
		this.instanceUuid = place.instanceUuid;
		this.mappaUuid = place.mappaUuid;
		this.locusUuid = place.locusUuid;
		place.attach(this);
	}

	/**
	 * Swaps cells with a target thing.
	 */
	protected doSwap(occupantPath: OccupantPath): void {
		// Get thing while nothing is changed yet
		let targetThing: Thing = this.pool.getOccupant(occupantPath);
		let targetLocusPath: LocusPath = { ...occupantPath };

		// Set target path
		targetThing.doMove(this);
		this.doMove(targetLocusPath);
	}

	/**
	 * Performs actual initialization.
	 *
	 * To be overriden by extending classes.
	 */
	protected abstract doInitialize(): void;

	/**
	 * Performs necessary cleanup.
	 */
	protected abstract doTerminate(): void;

	/**
	 * Moves to another location.
	 *
	 * Should call [[doMove]].
	 */
	protected abstract performMove(locusPath: LocusPath): void;

	/**
	 * Performs the swap of 2 [[Thing]].
	 *
	 * To be overriden by extending classes.
	 *
	 * Should call [[doSwap]].
	 */
	protected abstract performSwap(occupantPath: OccupantPath): void;
}

/**
 * [[Thing]] created by default.
 *
 * Not to be used.
 */
export class DefaultThing extends Thing {
	// No additional processing for a dummy class
	/**
	 * Performs actual initialization.
	 *
	 * To be overriden by extending classes.
	 */
	protected doInitialize(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

	// No additional processing for a dummy class
	/**
	 * Performs necessary cleanup.
	 */
	protected doTerminate(): void {} // eslint-disable-line class-methods-use-this, @typescript-eslint/no-empty-function

	/**
	 * Moves to another location.
	 */
	protected performMove(locusPath: LocusPath): void {
		this.doMove(locusPath);
	}

	/**
	 * Performs the swap of 2 [[Thing]].
	 *
	 * To be overriden by extending classes.
	 */
	protected performSwap(occupantPath: OccupantPath): void {
		this.doSwap(occupantPath);
	}
}
