/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Displays server information to canvas
 */

import { Application, Container, Matrix, Renderer, utils } from "pixi.js";
import {
	defaultEntityHeight,
	defaultEntityWidth,
	defaultMinimumEntityInColumn,
	defaultMinimumEntityInRow,
	defaultMobileEntityHeight,
	defaultMobileEntityWidth
} from "../common/defaults";
import { DirectionWord, MessageTypeWord } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { MovementWord, processQueueWord } from "../core/connection";
import { LogLevel } from "../core/error";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, CoreShardClassFactory } from "../core/shard";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientConnection, ClientPlayer } from "./connection";
import { ElementBall } from "./element-ball";
import { ClientGrid } from "./grid";
import {
	Input,
	InputInterface,
	downSymbol,
	lcSymbol,
	leftSymbol,
	levelDownSymbol,
	levelUpSymbol,
	localActionSymbol,
	rcSymbol,
	rightSymbol,
	scrollSymbol,
	upSymbol
} from "./input";
import { ClientOptions, clientOptions } from "./options";
import { uuidToName } from "./text";

/**
 * Created a client shard class.
 *
 * Static members initialization cannot reference base universe class.
 *
 * @param Universe - Client universe class
 * @returns Client shard class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientShardFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * A class for everything happening on the screen.
	 *
	 * Each shard to not interact with another and be treated as a separate thread.
	 */
	class ClientShard extends CoreShardClassFactory<
		ClientBaseClass,
		ClientBaseConstructorParams,
		ClientOptions,
		ClientGrid
	>({
		Base,
		options: clientOptions
	}) {
		/**
		 * Shard name for display.
		 *
		 * @returns Shard name
		 */
		public get shardName(): string {
			// TODO: Add shard dictionary sync
			return uuidToName({ uuid: this.shardUuid });
		}

		/**
		 * Pixi application.
		 */
		public readonly app: Application<HTMLCanvasElement>;

		/**
		 * Container for pixi.
		 */
		public readonly gridContainer: Container = new Container();

		/**
		 * Viewport for this client shard.
		 */
		public matrix: Matrix = Matrix.IDENTITY;

		public readonly players: Map<Uuid, ClientPlayer> = new Map();

		/**
		 * Scene height.
		 */
		public sceneHeight: number = defaultEntityHeight;

		/**
		 * Scene width.
		 */
		public sceneWidth: number = defaultEntityWidth;

		/**
		 * Element for shard container.
		 */
		public shardElement: HTMLElement = document.createElement("div");

		/** Units. */
		public units: Set<string> = new Set();

		/**
		 * Input events.
		 */
		private input: Input = new Input();

		/**
		 * Attached to HTML Canvas or not.
		 */
		private isAttached: boolean = false;

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor for a screen.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor(
			// ESLint bug - nested args
			// eslint-disable-next-line @typescript-eslint/typedef
			...[shard, { attachHook, created }, baseParams]: [
				...coreParams: CoreUniverseObjectConstructorParameters<
					ClientBaseConstructorParams,
					CoreShardArg<ClientOptions>,
					CoreArgIds.Shard,
					ClientOptions,
					CoreShardArgParentIds
				>,
				clientParams?: {
					/**
					 * Append or not.
					 */
					doAppend: boolean;
				}
			]
		) {
			// Call super constructor
			super(shard, { attachHook, created }, baseParams);

			this.app = new Application({
				antialias: true,
				autoDensity: true,
				backgroundAlpha: 0,
				resizeTo: this.shardElement
			});

			// Add container to renderer
			this.app.stage.addChild(this.gridContainer);

			/* eslint-disable no-magic-numbers, no-console, @typescript-eslint/no-unused-vars */
			// After attach
			attachHook
				.then(() => {
					// #if _DEBUG_ENABLED
					/**
					 * Type of debug params.
					 */
					type InputDebugParam = {
						/**
						 * Input symbol.
						 */
						symbol: symbol;
						/**
						 * Input data.
						 */
						input: InputInterface;
					};

					/**
					 * Prints some input info.
					 *
					 * @param param - Destructured parameter
					 */
					let inputDebug: (arg: InputDebugParam) => void = ({ symbol, input }: InputDebugParam) => {
						(this.constructor as typeof ClientShard).universe.log({
							level: LogLevel.Debug,
							message: `Shard received input(description="${symbol.description ?? "No description"}") at location(x="${
								input.x
							}", y="${input.y}").`
						});
					};
					// #endif

					// If we are here, we might already be attached, append shard and one-time resize
					// ESLint false negative
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					this.shardElement.appendChild(this.app.view);
					// ESLint false negative
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
					this.app.resize();

					// Set scene for entity show
					this.setScene();

					// Element ball display test
					new ElementBall({ container: this.gridContainer, scale: 500, ...ElementBall.windBall });

					// Add listeners for right-click input
					this.input.on(rcSymbol, (inputInterface: InputInterface) => {
						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface, symbol: rcSymbol });
						// #endif

						// TODO: Hold grid offsets; Terminate on first
						this.grids.forEach(grid => {
							const x: number = inputInterface.x / this.sceneWidth;
							const y: number = inputInterface.y / this.sceneHeight;
							const z: number = grid.currentLevel;
						});
					});

					// Add listeners for left-click input
					this.input.on(lcSymbol, inputInterface => {
						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: lcSymbol });
						// #endif
					});

					// Add listeners for level up input
					this.input.on(levelDownSymbol, inputInterface => {
						this.grids.forEach(grid => {
							grid.changeLevel({ level: grid.currentLevel + 1 });
						});
					});

					// Add listeners for level down input
					this.input.on(levelUpSymbol, inputInterface => {
						this.grids.forEach(grid => {
							grid.changeLevel({ level: grid.currentLevel - 1 });
						});
					});

					let movementInputEntries: [symbol: symbol, direction: MovementWord][] = [
						[downSymbol, DirectionWord.Down],
						[leftSymbol, DirectionWord.Left],
						[rightSymbol, DirectionWord.Right],
						[upSymbol, DirectionWord.Up]
					];

					// Add listeners for movement inputs
					// ESLint false negative
					// eslint-disable-next-line @typescript-eslint/typedef
					movementInputEntries.forEach(([symbol, direction]) => {
						// Async callback for event emitter
						// eslint-disable-next-line @typescript-eslint/no-misused-promises
						this.input.on(symbol, async inputInterface => {
							let connection: ClientConnection | undefined = Array.from(this.players)[0]?.[1].connection;
							connection?.socket.writeQueue({
								body: {
									direction,
									playerUuid: Array.from(this.players)[0]?.[1].playerUuid ?? "nothing",
									// TODO: Add active unit system
									unitUuid: Array.from(this.units)[0]
								},
								type: MessageTypeWord.Movement
							});
							await connection?.tick({ word: processQueueWord });

							// #if _DEBUG_ENABLED
							inputDebug({ input: inputInterface as InputInterface, symbol: leftSymbol });
							// #endif
						});
					});

					// Add listeners for local action
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(localActionSymbol, async inputInterface => {
						let connection: ClientConnection | undefined = Array.from(this.players)[0]?.[1].connection;
						connection?.socket.writeQueue({
							body: {
								playerUuid: Array.from(this.players)[0]?.[1].playerUuid ?? "nothing",
								unitUuid: Array.from(this.units)[0]
							},
							type: MessageTypeWord.LocalAction
						});
						await connection?.tick({ word: processQueueWord });
					});

					// Add listeners for scroll input
					this.input.on(scrollSymbol, inputInterface => {
						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: scrollSymbol });
						// #endif

						// Prototype only
						this.sceneHeight *= 1 + (inputInterface as InputInterface).y / 1000;
						this.sceneWidth *= 1 + (inputInterface as InputInterface).y / 1000;
						this.grids.forEach(grid => {
							grid.cells.forEach(cell => {
								cell.entities.forEach(entity => {
									// entity.updateCoordinates();
								});
							});
						});
					});
				})
				.catch(error => {
					(this.constructor as typeof ClientShard).universe.log({
						error: new Error("Error in attach hook execution", { cause: error instanceof Error ? error : undefined }),
						level: LogLevel.Alert
					});
				});
			/* eslint-enable no-magic-numbers, no-console, no-alert, @typescript-eslint/no-unused-vars */
		}

		/**
		 * Enables the rendering.
		 *
		 * @param renderer - The renderer that will draw the scene and its contents
		 */
		public addGridContainer(renderer: Renderer): void {
			renderer.render(this.gridContainer);
		}

		/**
		 * The function that fires the input received.
		 *
		 * @param inputSymbol - Input symbol received
		 * @param inputInterface - Input event received
		 */
		public fireInput(inputSymbol: symbol, inputInterface: InputInterface): void {
			this.input.emit(inputSymbol, inputInterface);
		}

		/**
		 * Set default scene dimensions.
		 *
		 * @remarks
		 * Pixi supports floating point sizes, so `ceil` not used.
		 */
		private setScene(): void {
			// Set defaults
			let entityHeight: number = utils.isMobile.any ? defaultMobileEntityHeight : defaultEntityHeight;
			let entityWidth: number = utils.isMobile.any ? defaultMobileEntityWidth : defaultEntityWidth;
			let aspectRatio: number = entityHeight / entityWidth;

			// Fix height
			if (this.app.screen.height / entityHeight < defaultMinimumEntityInColumn) {
				entityHeight = this.app.screen.height / defaultMinimumEntityInColumn;
				entityWidth = entityHeight / aspectRatio;
			}

			// Fix width, if still does not fit based on height
			if (this.app.screen.width / entityWidth < defaultMinimumEntityInRow) {
				entityWidth = this.app.screen.width / defaultMinimumEntityInRow;
				entityHeight = entityWidth * aspectRatio;
			}

			// Set actual values
			this.sceneHeight = entityHeight;
			this.sceneWidth = entityWidth;
		}
	}

	/**
	 * Attaches client grid.
	 *
	 * @param this - Client shard
	 * @param grid - Grid
	 */
	ClientShard.prototype.attachGrid = function (this: ClientShard, grid: ClientGrid): void {
		// Super first
		(Object.getPrototypeOf(ClientShard.prototype) as ClientShard).attachGrid.call(this, grid);

		// Basically show grid
		grid.shard = this;

		// Adding to container reversed, so that surface level is rendered last
		// TODO: Change to `toReversed()` when migrate to Node.js 20 - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toReversed#browser_compatibility
		Array.from(grid.levelIndex)
			.reverse()
			.forEach(container => {
				this.gridContainer.addChild(container);
			});

		grid.cells.forEach(cell => {
			grid.showCell(cell);
		});
	};

	// Return the shard class
	return ClientShard;
}

/**
 * Type of client shard class.
 */
export type ClientShardClass = ReturnType<typeof ClientShardFactory>;

/**
 * Instance type of client shard.
 */
export type ClientShard = InstanceType<ClientShardClass>;
