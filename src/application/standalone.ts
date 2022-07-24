/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone application.
 */

import { ClientLoader } from "../app/client/loader";
import { Application } from "../app/core/application";
import { ServerLoader, YamlEntry } from "../app/server/loader";
import { ModuleFactoryRecordListConstraint } from "../app/server/module";

/**
 * Standalone app.
 */
export class StandaloneApplication<T extends ModuleFactoryRecordListConstraint<T>> extends Application {
	public clientLoader: ClientLoader;

	public serverLoader: ServerLoader<T>;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameters
	 */
	public constructor({
		records,
		yamlList
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
	}) {
		super();
		this.clientLoader = new ClientLoader({ application: this });
		this.serverLoader = new ServerLoader({ application: this, records, yamlList });
	}
}
