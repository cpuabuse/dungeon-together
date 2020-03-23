/*
	File: src/app/render/screen.ts
	cpuabuse.com
*/

/**
 * Displaying to screen.
 */

import { Application, BaseTexture, Texture } from "pixi.js";
import { CommsMap, Instance, InstanceUuid, Instanceability } from "../shared/interfaces";
import { Default } from "../common/types";
import { DefaultModes, defaultModes } from "../common/defaults";
import { Vao } from "./vao";
import { Screenable } from "./screenable";
import { ClientReality } from "./client-reality";

/**
 * Screen textures and meta.
 */
export interface Mode {
	/**
	 * Actual texture array.
	 */
	textures: Array<Texture>;
}

/**
 * Animations for screen.
 */
export interface Modes {
	/**
	 * Actual animation.
	 */
	[key: string]: Mode;
}

/**
 * Animations for screen.
 */
export interface StrictModes {
	/**
	 * Actual animation.
	 */
	[key: string]: Mode;

	/**
	 * Mandatory default animation.
	 */
	default: Mode;
}

/**
 * Arguments for screen.
 */
export interface ScreenArgs extends Instance {
	app: Application;
	modes: Modes;
}

/**
 * Allows [[Screenable]] access [[DisplayReality]].
 */
export interface Screen extends Instanceability {
	reality: ClientReality;
}

/**
 * A class for everything happening on the screen.
 */
export class Screen extends Screenable implements Instance {
	/**
	 * This.
	 */
	instance: InstanceUuid;

	/**
	 * Different unique textures for sprites to take.
	 * Has built-in default mode, which is readonly.
	 */
	public modes: Default<DefaultModes, Mode> = {
		default: {
			textures: [
				new Texture(new BaseTexture("img/bunny-red.svg")),
				new Texture(new BaseTexture("img/bunny-green.svg")),
				new Texture(new BaseTexture("img/bunny-blue.svg"))
			]
		}
	};

	/**
	 * App to use.
	 */
	public app: Application;

	/**
	 * An array of maps for screen.
	 */
	public maps: Array<CommsMap> = new Array();

	/**
	 * Constructor for a screen.
	 */
	public constructor({ instance }: Instance) {
		// Call super constructor
		super();

		// Set the app
		this.app = app;

		// Set the modes
		Object.keys(modes).forEach(mode => {
			// Cannot overwrite readonly; Since types are different, the literal comparison instead of "includes" used
			let notDefault: boolean = true;
			defaultModes.forEach(function(defaultMode) {
				if (defaultMode === mode) {
					notDefault = false;
				}
			});

			// Set mode
			if (notDefault) {
				this.modes[mode] = modes[mode];
			}
		});

		// Extract data from screen
		maps.forEach(map => {
			this.maps.push(new Vao({ locations: map.locations, screen: this }));
		});
	}
}
