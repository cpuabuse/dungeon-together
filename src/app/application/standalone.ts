/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone application.
 */

import { ClientLoader } from "../client/loader";
import { MaybeDefined } from "../common/utility-types";
import { Application } from "../core/application";
import { Reader, ServerLoader, YamlEntry } from "../server/loader";
import { ModuleFactoryRecordListConstraint } from "../server/module";

/**
 * Standalone app.
 */
export class StandaloneApplication<
	R extends string = never,
	T extends ModuleFactoryRecordListConstraint<T> = any
> extends Application {
	/**
	 * Client loader.
	 */
	public clientLoader: ClientLoader;

	/**
	 * Server loader.
	 */
	public serverLoader: ServerLoader<R, T>;

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameters
	 */
	public constructor({
		readers,
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
			[key: string]: YamlEntry<R | "url">;
		};

		/**
		 * HTML element name.
		 */
		element: string;
	} & MaybeDefined<
		[Exclude<R, "url">] extends [never] ? false : true,
		{
			/**
			 * Readers.
			 */
			readers: {
				[K in Exclude<R, "url">]: Reader;
			} & {
				/**
				 * URL reader.
				 */
				url?: Reader;
			};
		}
	>) {
		super();
		this.clientLoader = new ClientLoader({
			application: this,
			element: document.getElementById(element) ?? document.body
		});
		this.serverLoader = new ServerLoader({
			application: this,
			readers,
			records,
			yamlList
			// Generic condition needs cast
		} as ConstructorParameters<typeof ServerLoader>[0]) as ServerLoader<R, T>;
	}
}
