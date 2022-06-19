/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity that can be rendered.
 */

import { AnimatedSprite } from "pixi.js";
import { CoreArgIds } from "../core/arg";
import { CoreEntityArg, CoreEntityArgParentIds, CoreEntityClassFactory } from "../core/entity";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseClassWithConstructorParams } from "./base";
import { ClientOptions, clientOptions } from "./options";

/**
 * Generator for the client entity class.
 *
 * @param param - Destructured parameter
 * @returns Client entity class
 */
// Force type inference to extract class type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ClientEntityFactory({
	Base
}: {
	/**
	 * Client base.
	 */
	Base: ClientBaseClass;
}) {
	/**
	 * Render unit, representing set of animations.
	 */
	class ClientEntity extends CoreEntityClassFactory({ Base, options: clientOptions }) {
		/**
		 * Animated sprite.
		 */
		public sprite: AnimatedSprite;

		/**
		 * Initializes client entity.
		 *
		 * @param param - Destructure parameter
		 */
		// Nested args ESLint bug
		// eslint-disable-next-line @typescript-eslint/typedef
		public constructor([entity, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
			ClientBaseClassWithConstructorParams,
			CoreEntityArg<ClientOptions>,
			CoreArgIds.Entity,
			ClientOptions,
			CoreEntityArgParentIds
		>) {
			// Call super constructor
			super(entity, { attachHook, created }, baseParams);

			// Create a new Sprite from texture
			this.sprite = new AnimatedSprite(ClientEntity.universe.getMode({ uuid: this.modeUuid }).textures);
		}
	}

	/**
	 * Terminates client entity.
	 *
	 * @param this - Client entity
	 */
	ClientEntity.prototype.terminateEntity = function (this: ClientEntity): void {
		// Stop
		this.sprite.destroy();

		// Super terminate
		(Object.getPrototypeOf(ClientEntity.prototype) as ClientEntity).terminateEntity();
	};

	// Return class
	return ClientEntity;
}

/**
 * Type of client shard class.
 */
export type ClientEntityClass = ReturnType<typeof ClientEntityFactory>;

/**
 * Instance type of client shard.
 */
export type ClientEntity = InstanceType<ClientEntityClass>;
