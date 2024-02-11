/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Entity that can be rendered.
 */

import { AnimatedSprite, Container } from "pixi.js";
import { CoreArgIds } from "../core/arg";
import { CoreDictionary } from "../core/connection";
import { CoreEntityArg, CoreEntityClassFactory } from "../core/entity";
import { CoreEntityArgParentIds } from "../core/parents";
import { CoreUniverseObjectConstructorParameters } from "../core/universe-object";
import { ClientBaseClass, ClientBaseConstructorParams } from "./base";
import { ClientOptions, clientOptions } from "./options";
import { ProgressBar, enemyHpBarColors, friendlyHpBarColors } from "./progess-bar";

/**
 * Progress bar scale.
 */
const progressBarScale: number = 0.9;

/**
 * Default max health.
 */
const defaultMaxHealth: number = 100;

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
		public container: Container = new Container();

		/**
		 * Dictionary getter.
		 *
		 * @returns Local dictionary
		 */
		public get dictionary(): CoreDictionary {
			return this.internalDictionary;
		}

		/**
		 * Dictionary setter.
		 */
		public set dictionary(dictionary: CoreDictionary) {
			this.internalDictionary = dictionary;
		}

		public healthBar: ProgressBar | null = null;

		/**
		 * Temporary health.
		 */

		/**
		 * Health getter.
		 *
		 * @returns Health
		 */
		public get health(): number | null {
			const { health }: CoreDictionary = this.dictionary;
			if (typeof health === "number") {
				return health;
			}
			return null;
		}

		/**
		 * Max health getter.
		 *
		 * @returns Max health
		 */
		public get maxHealth(): number {
			const { maxHealth }: CoreDictionary = this.dictionary;
			if (typeof maxHealth === "number") {
				return maxHealth;
			}
			if (this.health !== null) {
				return this.health <= defaultMaxHealth ? defaultMaxHealth : this.health;
			}
			return defaultMaxHealth;
		}

		/**
		 * Wether universe contains this.
		 *
		 * @remarks
		 * Basically with this we are allowing cells to contain entities that are not part of the universe or are already terminated, at least for now.
		 */
		public isInUniverse: boolean = false;

		/**
		 * Animated sprite.
		 */
		public sprite: AnimatedSprite;

		/**
		 * Storing health.
		 * TODO: Move to emits.
		 */
		public tempHealth: number = 0;

		protected internalDictionary: CoreDictionary = {};

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

			this.container.addChild(this.sprite);
		}

		/**
		 * To be called when dictionary is updated.
		 */
		public onUpdateDictionary(): void {
			if (this.health) {
				if (this.healthBar) {
					// Update health
					this.healthBar.value = this.health;
				} else {
					// TODO: Determining of bar color should not be mode
					// TODO: Centering should be done more elegantly
					// Create health bar
					this.healthBar = new ProgressBar({
						colors: this.modeUuid === "mode/user/player/default" ? friendlyHpBarColors : enemyHpBarColors,
						container: this.container,
						scale: this.sprite.width * progressBarScale
					});

					// Set aspect ratio
					this.healthBar.mesh.x = 0.05;
					this.healthBar.mesh.y = 0.025;

					// Set current values
					this.healthBar.maxValue = this.maxHealth;
					this.healthBar.value = this.health;
				}
			} else if (this.healthBar) {
				// Destroy and deregister health bar
				this.healthBar.destroy();
				this.healthBar = null;
			}
			// Do nothing if health bar and health both not specified
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

		this.container.destroy();

		// Remove from universe
		this.isInUniverse = false;

		// Super terminate
		(Object.getPrototypeOf(ClientEntity.prototype) as ClientEntity).terminateEntity.call(this);
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
