/*
	File: src/app/render/screen.ts
	cpuabuse.com
*/

/**
 * Displaying to screen.
 */

import { Application, Container, Matrix, Renderer, utils } from "pixi.js";
import { Instance, InstanceArgs } from "../shared/comms/instance";
import { MappaArgs, MappaPath } from "../shared/comms/mappa";
import { Uuid, getDefaultUuid } from "../common/uuid";
import {
	defaultMinimumScenesInColumn,
	defaultMinimumScenesInRow,
	defaultMobileSceneHeight,
	defaultMobileSceneWidth,
	defaultSceneHeight,
	defaultSceneWidth,
	mappaUuidUrlPath,
	urlPathSeparator
} from "../common/defaults";
import { ClientConnection } from "./connection";
import { Clientable } from "./clientable";
import { Grid } from "./grid";
import { Mode } from "./mode";
import { View } from "./view";

/**
 * A class for everything happening on the screen.
 *
 * Each instance to not interact with another and be treated as a separate thread.
 */
export class Canvas extends Clientable implements Instance, View {
	/**
	 * Pixi application.
	 */
	public readonly app: Application = new Application({
		antialias: true,
		autoDensity: true,
		transparent: true
	});

	/**
	 * Server connection.
	 */
	public connection: ClientConnection = new Object() as ClientConnection;

	/**
	 * UUID for default [[Grid]].
	 */
	public readonly defaultMappaUuid: Uuid;

	/**
	 * Container for pixi.
	 */
	public readonly gridContainer: Container = new Container();

	/**
	 * This UUID.
	 */
	public readonly instanceUuid: Uuid;

	/**
	 * Mappas for the canvas.
	 *
	 * Should be treated as "readonly".
	 */
	public readonly mappas: Map<Uuid, Grid> = new Map();

	/**
	 * Viewport for this canvas.
	 */
	public matrix: Matrix = Matrix.IDENTITY;

	/**
	 * Scene height.
	 */
	public sceneHeight: number = defaultSceneHeight;

	/**
	 * Scene width.
	 */
	public sceneWidth: number = defaultSceneWidth;

	/**
	 * Attached to HTML Canvas or not.
	 */
	private isAttached: boolean = false;

	/**
	 * Constructor for a screen.
	 */
	public constructor({ instanceUuid, mappas }: InstanceArgs) {
		// Call super constructor
		super();

		// Set this fields
		this.instanceUuid = instanceUuid;
		this.defaultMappaUuid = getDefaultUuid({
			path: `${mappaUuidUrlPath}${urlPathSeparator}${this.instanceUuid}`
		});

		// Set scene
		this.setScene();

		// Add container to renderer
		this.app.stage.addChild(this.gridContainer);

		setTimeout(() => {
			// Initialize children
			this.addMappa({
				// Take path from this
				...this,
				locis: new Map(),
				mappaUuid: this.defaultMappaUuid
			});

			// Extract data from [Instance]
			mappas.forEach(mappa => {
				this.addMappa(mappa);
			});
		});
	}

	/**
	 * Adds [[Grid]].
	 */
	public addMappa(mappa: MappaArgs): void {
		if (this.mappas.has(mappa.instanceUuid)) {
			// Clear the instance if it already exists
			this.doRemoveGrid(mappa);
		}
		this.mappas.set(mappa.mappaUuid, new Grid(mappa));
	}

	/**
	 * Enables the rendering.
	 */
	public addGridContainer(renderer: Renderer): void {
		renderer.render(this.gridContainer);
	}

	/**
	 * Attach to HTML canvas.
	 * Can only be attached once, and never detached.
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
	 * Shortcut to get the [[Grid]].
	 */
	public getMappa({ mappaUuid }: MappaPath): Grid {
		let grid: Grid | undefined = this.mappas.get(mappaUuid);

		// Default grid is always there
		return grid === undefined ? (this.mappas.get(this.defaultMappaUuid) as Grid) : grid;
	}

	/**
	 * Get the modes from the server.
	 */
	public get modes(): Map<Uuid, Mode> {
		return new Map();
	}

	/**
	 * Removes the [[Grid]]
	 * @param uuid UUID of the [[Grid]]
	 */
	public removeMappa(path: MappaPath): void {
		if (path.mappaUuid !== this.defaultMappaUuid) {
			this.doRemoveGrid(path);
		}
	}

	/**
	 * Performs the necessary cleanup when instance is removed, as a connection to server.
	 */
	public terminate(): void {
		this.mappas.forEach(grid => {
			this.doRemoveGrid(grid);
		});
	}

	/**
	 * Actually remove the [[Grid]] instance from "mappas".
	 */
	private doRemoveGrid({ mappaUuid }: MappaPath): void {
		let grid: Grid | undefined = this.mappas.get(mappaUuid);
		if (grid !== undefined) {
			grid.terminate();
			this.mappas.delete(mappaUuid);
		}
	}

	/**
	 * Set default scene dimentions.
	 */
	private setScene(): void {
		// Set defaults
		let sceneHeight: number = utils.isMobile.any ? defaultMobileSceneHeight : defaultSceneHeight;
		let sceneWidth: number = utils.isMobile.any ? defaultMobileSceneWidth : defaultSceneWidth;
		let aspectRatio: number = sceneHeight / sceneWidth;

		// Fix height
		if (sceneHeight > 0) {
			if (this.app.screen.height / sceneHeight < defaultMinimumScenesInColumn) {
				sceneHeight = defaultMinimumScenesInColumn;
				sceneWidth = Math.ceil(sceneHeight / aspectRatio);
			}
		}

		// Fix width
		if (sceneWidth > 0) {
			if (this.app.screen.width / sceneWidth < defaultMinimumScenesInRow) {
				sceneWidth = defaultMinimumScenesInRow;
				sceneHeight = Math.ceil(sceneWidth * aspectRatio);
			}
		}

		// Set actual values
		this.sceneHeight = sceneHeight;
		this.sceneWidth = sceneWidth;
	}
}
