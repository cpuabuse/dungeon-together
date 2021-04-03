/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Displays server information to canvas.
 */

import { Application, Container, Matrix, Renderer, utils } from "pixi.js";
import {
	defaultEntityHeight,
	defaultEntityWidth,
	defaultMinimumEntityInColumn,
	defaultMinimumEntityInRow,
	defaultMobileEntityHeight,
	defaultMobileEntityWidth,
	gridUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { Uuid, getDefaultUuid } from "../common/uuid";
import { CommsGridArgs, GridPath } from "../comms/grid";
import { CommsShard, CommsShardArgs } from "../comms/shard";
import { ClientConnection } from "./connection";
import { ClientGrid } from "./grid";
import { Input, InputInterface, downSymbol, leftSymbol, mcSymbol, rcSymbol, rightSymbol, upSymbol } from "./input";
import { Mode } from "./mode";
import { ClientProto } from "./proto";
import { View } from "./view";

/**
 * A class for everything happening on the screen.
 *
 * Each shard to not interact with another and be treated as a separate thread.
 */
export class ClientShard extends ClientProto implements CommsShard, View {
	/**
	 * Pixi application.
	 */
	public readonly app: Application = new Application({
		antialias: true,
		autoDensity: true,
		height: 750,
		transparent: true,
		width: 750
	});

	/**
	 * Server connection.
	 */
	public connection: ClientConnection = new Object() as ClientConnection;

	/**
	 * UUID for default [[ClientGrid]].
	 */
	public readonly defaultGridUuid: Uuid;

	/**
	 * Container for pixi.
	 */
	public readonly gridContainer: Container = new Container();

	/**
	 * This UUID.
	 */
	public readonly shardUuid: Uuid;

	/**
	 * Grids for the client shard.
	 *
	 * Should be treated as "readonly".
	 */
	public readonly grids: Map<Uuid, ClientGrid> = new Map();

	/**
	 * Viewport for this client shard.
	 */
	public matrix: Matrix = Matrix.IDENTITY;

	/**
	 * Scene height.
	 */
	public sceneHeight: number = defaultEntityHeight;

	/**
	 * Scene width.
	 */
	public sceneWidth: number = defaultEntityWidth;

	/**
	 * Attached to HTML Canvas or not.
	 */
	private isAttached: boolean = false;

	/**
	 * Input events.
	 */
	private input: Input = new Input();

	/**
	 * Constructor for a screen.
	 */
	public constructor({ shardUuid, grids }: CommsShardArgs) {
		// Call super constructor
		super();

		// Set this fields
		this.shardUuid = shardUuid;
		this.defaultGridUuid = getDefaultUuid({
			path: `${gridUuidUrlPath}${urlPathSeparator}${this.shardUuid}`
		});

		// Set scene
		this.setScene();

		// Add container to renderer
		this.app.stage.addChild(this.gridContainer);

		setTimeout(() => {
			// Initialize children
			this.addGrid({
				// Take path from this
				...this,
				cells: new Map(),
				gridUuid: this.defaultGridUuid
			});

			// Extract data from [CommsShard]
			grids.forEach(grid => {
				this.addGrid(grid);
			});
		});

		// Add listeners for righ-click input
		this.input.on(rcSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});

		// Add listeners for middleclick input
		this.input.on(mcSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});

		// Add listeners for up input
		this.input.on(upSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});

		// Add listeners for down input
		this.input.on(downSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});
		// Add listeners for right input
		this.input.on(rightSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});
		// Add listeners for left input
		this.input.on(leftSymbol, inputInterface => {
			alert(`x is ${(inputInterface as InputInterface).x} and y is ${(inputInterface as InputInterface).y}`);
		});
	}

	/**
	 * Adds [[ClientGrid]].
	 *
	 * @param grid
	 */
	public addGrid(grid: CommsGridArgs): void {
		if (this.grids.has(grid.shardUuid)) {
			// Clear the shard if it already exists
			this.doRemoveGrid(grid);
		}
		this.grids.set(grid.gridUuid, new ClientGrid(grid));
	}

	/**
	 * Enables the rendering.
	 *
	 * @param renderer
	 */
	public addGridContainer(renderer: Renderer): void {
		renderer.render(this.gridContainer);
	}

	/**
	 * Attach to HTML canvas.
	 * Can only be attached once, and never detached.
	 *
	 * @param element
	 */
	public attach(element: HTMLElement): void {
		// Performing once, as pixi library does not allow to detach
		if (!this.isAttached) {
			this.isAttached = true;
			element.addEventListener("resize", () => {
				this.app.renderer.resize(element.offsetWidth, element.offsetHeight);
				this.setScene();
			});

			// Attach to canvas
			element.appendChild(this.app.view);
		}
	}

	/**
	 * Shortcut to get the [[ClientGrid]].
	 */
	public getGrid({ gridUuid }: GridPath): ClientGrid {
		let clientGrid: ClientGrid | undefined = this.grids.get(gridUuid);

		// Default grid is always there
		return clientGrid === undefined ? (this.grids.get(this.defaultGridUuid) as ClientGrid) : clientGrid;
	}

	/**
	 * The function that fires the input received.
	 *
	 * @param inputSymbol - Input symbol received
	 * @param inputInterface - Input event received
	 */
	public fireInput(inputSymbol: symbol, inputInterface: InputInterface) {
		this.input.emit(inputSymbol, inputInterface);
	}

	/**
	 * Get the modes from the server.
	 */
	public get modes(): Map<Uuid, Mode> {
		return new Map();
	}

	/**
	 * Removes the [[ClientGrid]]
	 *
	 * @param uuid UUID of the [[ClientGrid]]
	 * @param path
	 */
	public removeGrid(path: GridPath): void {
		if (path.gridUuid !== this.defaultGridUuid) {
			this.doRemoveGrid(path);
		}
	}

	/**
	 * Performs the necessary cleanup when shard is removed, as a connection to server.
	 */
	public terminate(): void {
		this.grids.forEach(grid => {
			this.doRemoveGrid(grid);
		});
	}

	/**
	 * Actually remove the [[ClientGrid]] shard from "grids".
	 */
	private doRemoveGrid({ gridUuid }: GridPath): void {
		let grid: ClientGrid | undefined = this.grids.get(gridUuid);
		if (grid !== undefined) {
			grid.terminate();
			this.grids.delete(gridUuid);
		}
	}

	/**
	 * Set default scene dimentions.
	 */
	private setScene(): void {
		// Set defaults
		let entityHeight: number = utils.isMobile.any ? defaultMobileEntityHeight : defaultEntityHeight;
		let entityWidth: number = utils.isMobile.any ? defaultMobileEntityWidth : defaultEntityWidth;
		let aspectRatio: number = entityHeight / entityWidth;

		// Fix height
		if (entityHeight > 0) {
			if (this.app.screen.height / entityHeight < defaultMinimumEntityInColumn) {
				entityHeight = defaultMinimumEntityInColumn;
				entityWidth = Math.ceil(entityHeight / aspectRatio);
			}
		}

		// Fix width
		if (entityWidth > 0) {
			if (this.app.screen.width / entityWidth < defaultMinimumEntityInRow) {
				entityWidth = defaultMinimumEntityInRow;
				entityHeight = Math.ceil(entityWidth * aspectRatio);
			}
		}

		// Set actual values
		this.sceneHeight = entityHeight;
		this.sceneWidth = entityWidth;
	}
}
