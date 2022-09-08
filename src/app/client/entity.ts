/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity that can be rendered.
 */

import { AnimatedSprite } from "pixi.js";
import { CoreArgIds } from "../core/arg";
import { CoreEntityArg, CoreEntityClassFactory } from "../core/entity";
import { CoreEntityArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
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
	class ClientEntity extends CoreEntityClassFactory<ClientBaseClass, ClientBaseConstructorParams, ClientOptions>({
		Base,
		options: clientOptions
	}) {
		/**
		 * Animated sprite.
		 */
		public sprite: AnimatedSprite;

		// ESLint params bug
		// eslint-disable-next-line jsdoc/require-param
		/**
		 * Initializes client entity.
		 *
		 * @param param - Destructure parameter
		 */
		public constructor(
			// Nested args ESLint bug
			// eslint-disable-next-line @typescript-eslint/typedef
			...[entity, { attachHook, created }, baseParams]: CoreUniverseObjectConstructorParameters<
				ClientBaseConstructorParams,
				CoreEntityArg<ClientOptions>,
				CoreArgIds.Entity,
				ClientOptions,
				CoreEntityArgParentIds
			>
		) {
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
		Array.from(ClientEntity.universe.shards)[1][1].toast.show({
			modeUuid: "death",
			x: this.sprite.x,
			y: this.sprite.y,
			z: 0
		});

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
