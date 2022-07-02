/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity within cells.
 */

import { Uuid } from "../../common/uuid";
import { CoreArgIds } from "../../core/arg";
import { CoreEntityArg, CoreEntityArgParentIds, CoreEntityClassFactory } from "../../core/entity";
import { CoreUniverseObjectConstructorParameters } from "../../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "../base";
import { ServerOptions, serverOptions } from "../options";
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
		 * Default kind.
		 */
		private static DefaultKind: EntityKindClass = class DefaultKind extends this.BaseKind {};

		/**
		 * Kinds, also generate default kind.
		 */
		private static kinds: Map<Uuid, EntityKindClass> = new Map([]);

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

			// Initialize kind
			this.kind = new (ServerEntity.kinds.get(this.kindUuid) ?? ServerEntity.DefaultKind)({ entity: this });

			// On attach
			attachHook
				.then(() => {
					this.kind.onCreateEntity();
				})
				.catch(() => {
					// TODO: Process error
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
	}

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
