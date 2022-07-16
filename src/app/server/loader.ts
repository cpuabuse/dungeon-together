/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Performs loading of the server.
 *
 * @file
 */

import { readFile } from "fs";
import axios from "axios";
import { Application } from "../core/application";
import { yamlOptions } from "../yaml/options";
import { ModuleFactoryRecordList, ModuleFactoryRecordListConstraint, ModuleList } from "./module";
import { serverOptions } from "./options";
import { ServerUniverse } from "./universe";

/**
 * Yaml entry types.
 */
export enum YamlEntryType {
	File = "file",
	Url = "url"
}

/**
 * Yaml entry to register into loader.
 */
export type YamlEntry = {
	/**
	 * Path to yaml file or URL.
	 */
	path: string;

	/**
	 * Path type.
	 */
	type: YamlEntryType;
};

/**
 * Loader class.
 */
export class ServerLoader<App extends Application, T extends ModuleFactoryRecordListConstraint<T>> {
	/**
	 * Application this resides in.
	 */
	private application: App;

	/**
	 * Default yaml file.
	 */
	private static defaultYaml: string = "";

	/**
	 * Factory records from constructor.
	 */
	private records: ModuleFactoryRecordList;

	/**
	 * UUIDs are not used, as they are not generated by the application for client.
	 */
	private yamlList: Map<string, YamlEntry> = new Map();

	/**
	 * Adds modules to loader.
	 *
	 * @param list - List of module factory records
	 * @remarks
	 * Safety comes from type constraint, so unnecessary checks omitted.
	 * By design, depends might contain irrelevant keys, and this function accounts for that.
	 */
	public constructor({
		application,
		records,
		yamlList
	}: {
		/**
		 * Application.
		 */
		application: App;

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
		this.application = application;
		this.records = records as unknown as ModuleFactoryRecordList;
		this.yamlList = new Map(Object.getOwnPropertyNames(yamlList).map(key => [key, yamlList[key]]));
	}

	/**
	 * Add server universe.
	 *
	 * @param param - Destructured parameter
	 * @returns Created universe
	 */
	public addUniverse({
		yamlId
	}: {
		/**
		 * ID of YAML.
		 */
		yamlId: string;
	}): ServerUniverse {
		/**
		 * Processed yaml.
		 *
		 * @param param - Destructured parameter
		 */
		const processYaml: ({
			data
		}: {
			/**
			 * Yaml data.
			 */
			data: string;
			// Type should be inferred from the const
			// eslint-disable-next-line @typescript-eslint/typedef
		}) => void = ({ data }) => {
			let moduleList: ModuleList = {};

			this.records.forEach(record => {
				moduleList[record.name] = record.factory({
					// False negative on type inference
					// eslint-disable-next-line @typescript-eslint/typedef
					modules: Object.entries(record.depends).reduce((result, [key, value]) => {
						return { ...result, [key]: moduleList[value] };
					}, {} as ModuleList),
					universe
				});
			});
		};

		const universe: ServerUniverse = this.application.addUniverse({ Universe: ServerUniverse, args: [] });
		const yamlEntry: YamlEntry | undefined = this.yamlList.get(yamlId);
		const yamlData: Promise<string> = new Promise((resolve, reject) => {
			switch (yamlEntry?.type) {
				case YamlEntryType.File:
					readFile(yamlEntry.path, (err, data) => {
						if (err) {
							reject(err);
						} else {
							resolve(data.toString());
						}
					});
					break;
				case YamlEntryType.Url:
					axios
						.get<string>(yamlEntry.path, { responseType: "text" })
						.then(result => resolve(result.data))
						.catch(error => reject(error));
					break;
				default:
					reject();
			}
		});

		yamlData
			.then(data => {
				processYaml({ data });
			})
			.catch(() => {
				// TODO: Process error
				processYaml({ data: ServerLoader.defaultYaml });
			});

		return universe;
	}
}