/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { DeferredPromise } from "../common/async";
import { Application } from "../core/application";
import { ClientUniverse } from "./universe";

/**
 * Client loader.
 *
 * @file
 */

/**
 * Client loader class.
 */
export class ClientLoader {
	/**
	 * Application this resides in.
	 */
	private application: Application;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		application
	}: {
		/**
		 * Application.
		 */
		application: Application;
	}) {
		this.application = application;
	}

	/**
	 * Adds universe.
	 *
	 * @param param - Destructured parameters
	 */
	public async addUniverse({
		element
	}: {
		/**
		 * HTML element name.
		 */
		element: string;
	}): Promise<ClientUniverse> {
		// Get the element to attach the universe
		const clientUniverseElement: HTMLElement | null = document.getElementById(element);
		const universeCreated: DeferredPromise<void> = new DeferredPromise();
		let universe: ClientUniverse = this.application.addUniverse({
			Universe: ClientUniverse,
			args: [
				{ created: universeCreated, element: clientUniverseElement === null ? document.body : clientUniverseElement }
			]
		});

		await universeCreated;

		return universe;
	}
}
