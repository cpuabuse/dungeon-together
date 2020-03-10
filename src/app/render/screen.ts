/*
	File: src/app/render/screen.ts
	cpuabuse.com
*/

/**
 * Displaying to screen.
 */

import { Application, BaseTexture, Texture } from "pixi.js";
import { Instance, Map } from "../comms/interfaces";
import { Vao } from "./vao";

/**
 * Screen textures and meta.
 */
export interface Animation {
	/**
	 * Actual texture array.
	 */
	textures: Array<Texture>;
}

/**
 * Animations for screen.
 */
export interface Animations {
	/**
	 * Actual animation.
	 */
	[key: string]: Animation;

	/**
	 * Mandatory default animation.
	 */
	default: Animation;
}

/**
 * Arguments for screen.
 */
export interface ScreenArgs extends Instance {
	app: Application;
}

/**
 * A class for everything happening on the screen.
 */
export class Screen implements Instance {
	/**
	 * Different unique textures for animated sprites to take.
	 */
	public animations: Animations = {
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
	public maps: Array<Map> = new Array();

	/**
	 * Constructor for a screen.
	 */
	public constructor({ app, maps }: ScreenArgs) {
		// Set the app
		this.app = app;

		// Extract data from screen
		maps.forEach(map => {
			this.maps.push(new Vao({ locations: map.locations, screen: this }));
		});
	}
}
