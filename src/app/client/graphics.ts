/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/
/**
 * @file
 * Client graphics library utilities.
 */

import { Container } from "pixi.js";

/**
 * Graphics container with children that can be accessed by keys.
 *
 * @remarks
 * Be careful overriding properties, as this class extends external library.
 */
export class ObjectLikeGraphicsContainer<Value extends string | number | symbol> extends Container {
	public containers: Record<Value, Container>;

	private values: Set<Value>;

	/**
	 * Public constructor.
	 *
	 * @param param - Destructured parameters
	 */
	public constructor({
		values
	}: {
		/**
		 * Values to be used as indexes of the containers.
		 */
		values: Set<Value>;
	}) {
		super();
		this.values = values;

		// Initialize containers
		// Cast since populated immediately
		this.containers = {} as Record<Value, Container>;
		values.forEach(value => {
			// Create container, add it to current container, register in internal containers
			this.containers[value] = this.addChild(new Container());
		});
	}
}
