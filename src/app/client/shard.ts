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
import { MessageTypeWord, MovementWord } from "../common/defaults/connection";
import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { CoreEnvelope, CorePlayer } from "../core/connection";
import { LogLevel } from "../core/error";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, CoreShardClassFactory } from "../core/shard";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerMessage } from "../server/connection";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ElementBall } from "./element-ball";
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
import { ClientToast } from "./toast";

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
	class ClientShard
		extends CoreShardClassFactory<ClientBaseClass, ClientBaseConstructorParams, ClientOptions, ClientGrid>({
			Base,
			options: clientOptions
		})
		implements CorePlayer
	{
		/**
		 * Pixi application.
		 */
		public readonly app: Application;

		/**
		 * Dict received from server.
		 */
		public dictionary: CorePlayer["dictionary"] = {};

		/**
		 * Container for pixi.
		 */
		public readonly gridContainer: Container = new Container();

		/**
		 * Is connected or not.
		 */
		public isConnected: boolean = false;

		/**
		 * Viewport for this client shard.
		 */
		public matrix: Matrix = Matrix.IDENTITY;

		/**
		 * Player UUID.
		 */
		// TODO: Use appropriate UUID generator function
		public playerUuid: Uuid = `player/${this.shardUuid}`;

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
		 * Toast for shard.
		 */
		public toast: ClientToast;

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

			// Initialize toast
			this.toast = new ClientToast({ displayTime: 3000, shard: this });

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
					this.shardElement.appendChild(this.app.view);
					this.app.resize();

					// Set scene for entity show
					this.setScene();

					// Element ball display test
					new ElementBall({ container: this.gridContainer, scale: 500, ...ElementBall.windBall });

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
						let envelope: CoreEnvelope<ServerMessage> = new CoreEnvelope({
							messages: [
								{
									body: {
										direction: MovementWord.Up,
										playerUuid: this.playerUuid,
										// TODO: Add active unit system
										unitUuid: Array.from(this.units)[0]
									},
									type: MessageTypeWord.Movement
								}
							]
						});
						await (this.constructor as typeof ClientShard).universe.connections
							.get(this.connectionUuid)
							?.socket.send(envelope);

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: upSymbol });
						// #endif
					});

					// Add listeners for down input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(downSymbol, async inputInterface => {
						let envelope: CoreEnvelope<ServerMessage> = new CoreEnvelope({
							messages: [
								{
									body: {
										direction: MovementWord.Down,
										playerUuid: this.playerUuid,
										// TODO: Add active unit system
										unitUuid: Array.from(this.units)[0]
									},
									type: MessageTypeWord.Movement
								}
							]
						});

						await (this.constructor as typeof ClientShard).universe.connections
							.get(this.connectionUuid)
							?.socket.send(envelope);

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: downSymbol });
						// #endif
					});

					// Add listeners for right input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(rightSymbol, async inputInterface => {
						let envelope: CoreEnvelope<ServerMessage> = new CoreEnvelope({
							messages: [
								{
									body: {
										direction: MovementWord.Right,
										playerUuid: this.playerUuid,
										// TODO: Add active unit system
										unitUuid: Array.from(this.units)[0]
									},
									type: MessageTypeWord.Movement
								}
							]
						});

						await (this.constructor as typeof ClientShard).universe.connections
							.get(this.connectionUuid)
							?.socket.send(envelope);

						// #if _DEBUG_ENABLED
						inputDebug({ input: inputInterface as InputInterface, symbol: rightSymbol });
						// #endif
					});

					// Add listeners for left input
					// Async callback for event emitter
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					this.input.on(leftSymbol, async inputInterface => {
						let envelope: CoreEnvelope<ServerMessage> = new CoreEnvelope({
							messages: [
								{
									body: {
										direction: MovementWord.Left,
										playerUuid: this.playerUuid,
										// TODO: Add active unit system
										unitUuid: Array.from(this.units)[0]
									},
									type: MessageTypeWord.Movement
								}
							]
						});

						await (this.constructor as typeof ClientShard).universe.connections
							.get(this.connectionUuid)
							?.socket.send(envelope);

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
