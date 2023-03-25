/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file A universe with everything.
 */

import { Uuid } from "../common/uuid";
import { CoreArgIds } from "../core/arg";
import { CorePlayer } from "../core/connection";
import { EntityPathExtended } from "../core/entity";
import { CoreShardArgParentIds } from "../core/parents";
import { CoreShardArg, CoreShardClassFactory } from "../core/shard";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ServerBaseClass, ServerBaseConstructorParams } from "./base";
import { ServerGrid } from "./grid";
import { ServerOptions, serverOptions } from "./options";

/**
 * Created a Server shard class.
 *
 * Static members initialization cannot reference base universe class.
 *
 * @param Universe - Server universe class
 * @returns Server shard class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ServerShardFactory({
	Base
}: {
	/**
	 * Server base.
	 */
	Base: ServerBaseClass;
}) {
	/**
	 * A whole universe.
	 */
	class ServerShard extends CoreShardClassFactory<
		ServerBaseClass,
		ServerBaseConstructorParams,
		ServerOptions,
		ServerGrid
	>({
		Base,
		options: serverOptions
	}) {
		/**
		 * Player data.
		 *
		 * @remarks
		 * Maps with UUID instead of socket, for access from kind.
		 */
		public players: Map<Uuid, CorePlayer> = new Map();

		/**
		 * Controlled unit list.
		 */
		public units: Map<Uuid, EntityPathExtended> = new Map();

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Constructor.
		 *
		 * @param param - Destructured parameters
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[shard, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ServerBaseConstructorParams,
				CoreShardArg<ServerOptions>,
				CoreArgIds.Shard,
				ServerOptions,
				CoreShardArgParentIds
			>
		) {
			// ServerProto
			super(shard, { attachHook, created }, baseParams);
		}
	}

	// Return class
	return ServerShard;
}

/**
 * Type of server shard class.
 */
export type ServerShardClass = ReturnType<typeof ServerShardFactory>;

/**
 * Instance type of server shard.
 */
export type ServerShard = InstanceType<ServerShardClass>;
