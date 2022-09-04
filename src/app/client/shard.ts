/*
	Copyright 2022 cpuabuse.com
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
import { MessageTypeWord, MovementWord } from "../common/defaults/connection";
import { CoreArgIds } from "../core/arg";
import { Envelope, VSocket } from "../core/connection";
import { LogLevel } from "../core/error";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, CoreShardClassFactory } from "../core/shard";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientGrid } from "./grid";
import {
	Input,
	InputInterface,
	downSymbol,
	lcSymbol,
	leftSymbol,
	rcSymbol,
	rightSymbol,
	scrollSymbol,
	upSymbol
} from "./input";
import { ClientOptions, clientOptions } from "./options";
import { ClientUniverse } from "./universe";

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
		 * Pixi application.
		 */
		public readonly app: Application;

		/**
		 * Container for pixi.
		 */
		public readonly gridContainer: Container = new Container();

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
		 * Element for shard container.
		 */
		public shardElement: HTMLElement = document.createElement("div");

		/**
		 * An array of sockets.
		 */
		protected sockets: Array<VSocket<ClientUniverse>> = new Array<VSocket<ClientUniverse>>();

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
			...[shard, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ClientBaseConstructorParams,
				CoreShardArg<ClientOptions>,
				CoreArgIds.Shard,
				ClientOptions,
				CoreShardArgParentIds
			>
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
							message: `Shard received input(description="${symbol.description ?? "No description"}) at location(x="${
								input.x
							}", y="${input.y}").`
						});
					};
					// #endif

					// If we are here, we might already be attached, append shard and one-time resize
					this.shardElement.appendChild(this.app.view);
					this.app.resize();

					// Set scene for entity show
					this.setScene();

					// Add listeners for right-click input
					this.input.on(rcSymbol, inputInterface => {
						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: rcSymbol });
						// #endif
					});

					// Add listeners for left-click input
					this.input.on(lcSymbol, inputInterface => {
						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: lcSymbol });
						// #endif
					});

					// Add listeners for up input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(upSymbol, async inputInterface => {
						// Even though when array is empty an envelope will not be used, in those situations performance is irrelevant, at least on the client side
						let envelope: Envelope = new Envelope({
							messages: [
								{
									body: { direction: MovementWord.Up },
									type: MessageTypeWord.Movement
								}
							]
						});
						await Promise.all(this.sockets.map(socket => socket.send({ envelope })));
					});

					// Add listeners for down input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(downSymbol, async inputInterface => {
						let envelope: Envelope = new Envelope({
							messages: [
								{
									body: { direction: MovementWord.Down },
									type: MessageTypeWord.Movement
								}
							]
						});
						await Promise.all(this.sockets.map(socket => socket.send({ envelope })));

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: downSymbol });
						// #endif
					});

					// Add listeners for right input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(rightSymbol, async inputInterface => {
						let envelope: Envelope = new Envelope({
							messages: [
								{
									body: { direction: MovementWord.Right },
									type: MessageTypeWord.Movement
								}
							]
						});
						await Promise.all(this.sockets.map(socket => socket.send({ envelope })));

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: rightSymbol });
						// #endif
					});

					// Add listeners for left input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(leftSymbol, async inputInterface => {
						let envelope: Envelope = new Envelope({
							messages: [
								{
									body: { direction: MovementWord.Left },
									type: MessageTypeWord.Movement
								}
							]
						});
						await Promise.all(this.sockets.map(socket => socket.send({ envelope })));

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: leftSymbol });
						// #endif
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
		 * Adds socket if does not exist.
		 *
		 * @param param - Destructured parameter
		 */
		public addSocket({
			socket
		}: {
			/**
			 * Client socket to add.
			 */
			socket: VSocket<ClientUniverse>;
		}): void {
			if (!this.sockets.includes(socket)) {
				this.sockets.push(socket);
			}
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
		 * Removes socket.
		 *
		 * @param param - Destructured parameter
		 */
		public removeSocket({
			socket
		}: {
			/**
			 * Client socket to remove.
			 */
			socket: VSocket<ClientUniverse>;
		}): void {
			let socketIndex: number = this.sockets.indexOf(socket);
			if (socketIndex > -1) {
				this.sockets.splice(socketIndex, 1);
			}
		}

		/**
		 * Set default scene dimensions.
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

	/**
	 * Attaches client grid.
	 *
	 * @param this - Client shard
	 * @param grid - Grid
	 */
	ClientShard.prototype.attachGrid = function (this: ClientShard, grid: ClientGrid): void {
		// Super first
		(Object.getPrototypeOf(ClientShard.prototype) as ClientShard).attachGrid.call(this, grid);

		// Bind to shard as a separate callback, deferred so matches when children show calls
		ClientShard.universe.universeQueue.addCallback({
			/**
			 * Callback.
			 */
			callback: () => {
				// Defer, to process cell at a time
				grid.shard = this;
			}
		});

		grid.cells.forEach(cell => {
			ClientShard.universe.universeQueue.addCallback({
				/**
				 * Callback.
				 */
				callback: () => {
					// Defer, to process cell at a time
					grid.showCell(cell);
				}
			});
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
