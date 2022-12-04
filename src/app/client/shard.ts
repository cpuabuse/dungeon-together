/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Displays server information to canvas
 */

import Color from "color";
import { array, number, tuple } from "fp-ts";
import { Application, Container, Geometry, Graphics, Matrix, Mesh, Renderer, Shader, utils } from "pixi.js";
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
import { HpBarColors, friendlyHpBarColors, hpBarColorWords } from "./progess-bar";
import { ClientToast } from "./toast";
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
		 * Toast for shard.
		 */
		public toast: ClientToast;

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

			// Call health bar
			this.healthBar(friendlyHpBarColors);

			// Visualize friendly, neutral and enemy HP bars

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
		 * Add health bar.
		 *
		 * @param param
		 */
		private healthBar({ accent, background, border, foregroundMain, foregroundSecondary }: HpBarColors): void {
			// Add dynamic size change
			let width: number = 1.0;

			let maxValue: number = 37;

			let value: number = 5;

			const height: number = 0.15;

			// Add color on main bar
			// eslint-disable-next-line no-magic-numbers
			let mainColor: Array<number> = foregroundMain
				.rgb()
				.array()
				.map(element => element / 255);

			// Add color on secondary bar
			// eslint-disable-next-line no-magic-numbers
			let secondaryColor: Array<number> = background
				.rgb()
				.array()
				.map(element => element / 255);

			// Add color on border
			// eslint-disable-next-line no-magic-numbers
			let borderColor: Array<number> = border
				.rgb()
				.array()
				.map(element => element / 255);

			const geometry: Geometry = new Geometry().addAttribute(
				"coord",
				[0, 0, 0, height, 1, height, 1, 0].map(element => element * width),
				2
			);
			geometry.addIndex([0, 1, 2, 0, 2, 3]);

			const shader: Shader = Shader.from(
				`
precision mediump float;
attribute vec2 coord;
uniform mat3 translationMatrix;
uniform mat3 projectionMatrix;
uniform float width;
varying float relativeWidth;
varying float relativeHeight;

void main() {
	relativeWidth = coord.x / width;
	relativeHeight = coord.y / width;
	gl_Position = vec4((projectionMatrix * translationMatrix * vec3(coord, 1.0)).xyz, 1.0);
}
`,
				`
precision mediump float;
varying float relativeWidth;
varying float relativeHeight;
uniform vec3 secondaryColor;
uniform vec3 mainColor;
uniform vec3 borderColor;
uniform float secondaryColorIntensity;
uniform float maxValue;
uniform float value;
uniform float borderRatio;
uniform float height;

void main() {
	float ratio = value / maxValue;

	if (relativeWidth >= borderRatio && (relativeWidth <= 1.0 - borderRatio) && relativeHeight >= borderRatio && (relativeHeight <= height - borderRatio)) {
		if (relativeWidth <= ratio) {
			gl_FragColor = vec4(mainColor + (secondaryColor - mainColor) * exp((relativeWidth / ratio - 1.0) * secondaryColorIntensity) * relativeWidth / ratio, 1.0);
		} else {
			gl_FragColor = vec4(secondaryColor, 1.0);
		}
	} else {
		gl_FragColor = vec4(borderColor, 1.0);
	}
}
`,
				{
					borderColor,
					borderRatio: 0.01,
					height,
					mainColor,
					maxValue,
					secondaryColor,
					secondaryColorIntensity: 10,
					value,
					width
				}
			);

			const bar: Mesh<Shader> = new Mesh(geometry, shader);
			bar.position.set(100, 100);
			bar.scale.set(50);
			this.app.stage.addChild(bar);
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
