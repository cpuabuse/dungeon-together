/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Client loader.
 *
 * @file
 */

import { DeferredPromise } from "../common/async";
import { Application } from "../core/application";
import { ClientUniverse } from "./universe";

/**
 * Client loader class.
 */
export class ClientLoader {
	public element: HTMLElement;

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
		application,
		element
	}: {
		/**
		 * Application.
		 */
		application: Application;

		/**
		 * HTML element.
		 */
		element: HTMLElement;
	}) {
		this.element = element;
		this.application = application;
	}

	/**
	 * Adds universe.
	 *
	 * @param param - Destructured parameters
	 */
	public async addUniverse(): Promise<ClientUniverse> {
		const universeCreated: DeferredPromise<void> = new DeferredPromise();
		const element: HTMLElement = this.element.appendChild(document.createElement("div"));
		let universe: ClientUniverse = this.application.addUniverse({
			Universe: ClientUniverse,
			args: [{ created: universeCreated, element }]
		});

		await universeCreated;

		return universe;
	}
}
