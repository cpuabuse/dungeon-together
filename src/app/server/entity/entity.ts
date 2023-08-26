/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity within cells.
 */

import { UrlPath } from "../../common/url";
import { Uuid } from "../../common/uuid";
import { CoreArgIds } from "../../core/arg";
import { CoreEntityArg, CoreEntityClassFactory } from "../../core/entity";
import { LogLevel } from "../../core/error";
import { CoreEntityArgParentIds } from "../../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "../base";
import { ServerOptions, serverOptions } from "../options";
import { ServerUniverseClass } from "../universe";
import { BaseEntityKindClassFactory, EntityKind, EntityKindClass } from "./kind";

/**
 * Generator for the server entity class.
 *
 * @param param - Destructured parameter
 * @returns Server entity class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerEntityFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * The server entity itself. Can be anything that resides within the [[Cell]].
	 *
	 * It is a responsibility of the classes extending [[ServerEntity]] to perform consistency checks on the arguments, thus the default values should always be provided.
	 *
	 * There are 2 ways to create a [[ServerEntity]]:
	 *
	 * // TODO: Add ways to create a thing
	 */
	class ServerEntity extends CoreEntityClassFactory<ServerBaseClass, ServerBaseConstructorParams, ServerOptions>({
		Base,
		options: serverOptions
	}) {
		/**
		 * The base kind.
		 */
		public static BaseKind: EntityKindClass = BaseEntityKindClassFactory({ Entity: this });

		/**
		 * Entity kind.
		 */
		public kind: EntityKind;

		/**
		 * Kinds, also generate default kind.
		 */
		public static kinds: Map<Uuid, EntityKindClass> = new Map([]);

		/**
		 * Player UUID.
		 */
		public playerUuid?: Uuid;

		/**
		 * Default kind.
		 */
		private static DefaultKind: EntityKindClass = class DefaultKind extends this.BaseKind {};

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 *
		 * @param param - Destructured parameter
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[entity, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ServerBaseConstructorParams,
				CoreEntityArg<ServerOptions>,
				CoreArgIds.Entity,
				ServerOptions,
				CoreEntityArgParentIds
			>
		) {
			// Call super constructor
			super(entity, { attachHook, created }, baseParams);

			/**
			 * Init kind with self executing anonymous function.
			 */
			// Infer type as assignment
			// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
			this.kind = (() => {
				let Kind: EntityKindClass | undefined = ServerEntity.kinds.get(this.kindUuid);
				if (!Kind) {
					Kind = ServerEntity.DefaultKind;
					// #if _DEBUG_ENABLED
					(this.constructor as ServerEntityClass).universe.log({
						level: LogLevel.Debug,
						message: `Kind(kindUuid="${this.kindUuid}") was not found, and entity(entityUuid=${this.entityUuid}) was created with default kind instead.`
					});
					// #endif
				}
				return new Kind({ entity: this });
			})();

			// On attach
			attachHook
				.then(() => {
					this.kind.onCreateEntity();
				})
				.catch(error => {
					(this.constructor as typeof ServerEntity).universe.log({
						error: new Error(`Attach hook of entity(entityUuid="${this.entityUuid}") produced an error.`, {
							cause: error instanceof Error ? error : undefined
						}),
						level: LogLevel.Warning
					});
				});
		}

		/**
		 * Gets the kind.
		 *
		 * @param param - Kind UUID
		 * @returns Kind class
		 */
		public static GetKind({
			kindUuid
		}: {
			/**
			 * Kind UUID.
			 */
			kindUuid: Uuid;
		}): EntityKindClass {
			return this.kinds.get(kindUuid) ?? this.DefaultKind;
		}

		/**
		 * Adds the kind.
		 *
		 * @param param - Destructured parameter
		 */
		public static addKind({
			id,
			Kind,
			namespace
		}: {
			/**
			 * Path.
			 */
			id: string;

			/**
			 * Kind class.
			 */
			Kind: EntityKindClass;

			/**
			 * Namespace.
			 */
			namespace: UrlPath;
		}): void {
			let kindUuid: Uuid = (this.universe.constructor as ServerUniverseClass).convertIdToUuid({ id, namespace });
			this.kinds.set(kindUuid, Kind);
			this.universe.log({
				level: LogLevel.Informational,
				message: `Kind(kindUuid="${kindUuid}") was added.`
			});
		}
	}

	/**
	 * Terminates client entity.
	 *
	 * @param this - Client entity
	 */
	ServerEntity.prototype.terminateEntity = function (this: ServerEntity): void {
		// Terminate kind
		this.kind.onTerminateEntity();

		// Super terminate
		(Object.getPrototypeOf(ServerEntity.prototype) as ServerEntity).terminateEntity.call(this);
	};

	// Return class
	return ServerEntity;
}

/**
 * Type of server entity class.
 */
export type ServerEntityClass = ReturnType<typeof ServerEntityFactory>;

/**
 * Instance type of server entity.
 */
export type ServerEntity = InstanceType<ServerEntityClass>;
