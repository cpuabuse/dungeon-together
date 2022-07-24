/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone application.
 */

import { ClientLoader } from "../client/loader";
import { Application } from "../core/application";
import { ServerLoader, YamlEntry } from "../server/loader";
import { ModuleFactoryRecordListConstraint } from "../server/module";

/**
 * Standalone app.
 */
export class StandaloneApplication<T extends ModuleFactoryRecordListConstraint<T> = any> extends Application {
	/**
	 * Client loader.
	 */
	public clientLoader: ClientLoader;

	/**
	 * Server loader.
	 */
	public serverLoader: ServerLoader<T>;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameters
	 */
	public constructor({
		records,
		yamlList,
		element
	}: {
		/**
		 * Factory records list.
		 */
		records: T;

		/**
		 * List of yaml files.
		 */
		yamlList: {
			[key: string]: YamlEntry;
		};

		/**
		 * HTML element name.
		 */
		element: string;
	}) {
		super();
		this.clientLoader = new ClientLoader({
			application: this,
			element: document.getElementById(element) ?? document.body
		});
		this.serverLoader = new ServerLoader({ application: this, records, yamlList });
	}
}
