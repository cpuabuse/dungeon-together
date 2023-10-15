<!-- Universe UI per shard -->
<template>
	<!-- Undefined assertion since index used in iteration -->
	<UniverseUiShardPlayer
		v-for="([playerUuid, { player } ], index) in (playerEntries as PlayerEntries)"
		:key="playerUuid"
		v-model="playerEntries[index]![1].model"
		:shard="shard"
		:player="player"
		@shift-player-notifications="() => onShiftPlayerNotifications(player)"
		@menu-items="onMenuItems"
	/>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ThisVueStore, UniverseState } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { overlayBusEmits, useOverlayBusIntermediate } from "../core/overlay";
import { PlayerEntries, UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiShardPlayer from "./universe-ui-shard-player.vue";

export default defineComponent({
	components: { UniverseUiShardPlayer },

	/**
	 * Created callback.
	 */
	created() {
		this.updatePlayerEntries();

		this.unsubscribeUpdatePlayerEntries = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updateUniverse") {
				this.updatePlayerEntries();
			}
		});
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		const { universe }: UniverseState = (this as unknown as ThisVueStore).$store.state;
		return {
			playerEntries: new Array() as PlayerEntries,
			universe,
			unsubscribeUpdatePlayerEntries: null as (() => void) | null
		};
	},

	emits: ["update:modelValue", ...overlayBusEmits],

	methods: {
		/**
		 * Method to shift player notifications.
		 *
		 * @param player - Player
		 */
		onShiftPlayerNotifications(player: ClientPlayer): void {
			// We are mutating notifications which is not directly a player prop
			// eslint-disable-next-line vue/no-mutating-props
			player.notificationIds.shift();
		},

		/**
		 * Update player entries data.
		 */
		updatePlayerEntries(): void {
			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			(this.playerEntries as PlayerEntries) = Array.from(this.shard.players.entries()).map(([playerUuid, player]) => {
				return [
					playerUuid,
					{
						model: {
							// Initial dictionary is set correctly
							dictionary: player.dictionary
						},
						player
					}
				];
			});

			this.$emit("update:modelValue", {
				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				playerEntries: this.playerEntries as PlayerEntries
			} satisfies UniverseUiShardModel);
		}
	},

	props: {
		modelValue: { required: true, type: Object as PropType<UniverseUiShardModel> },

		shard: {
			required: true,
			type: Object as PropType<ClientShard>
		}
	},

	/**
	 * Setup.
	 *
	 * @param props - Props
	 * @param param - Context
	 * @returns Composed properties
	 */
	// Force vue inference
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return useOverlayBusIntermediate({ emit });
	},

	/**
	 * Unmounted callback.
	 */
	unmounted() {
		if (this.unsubscribeUpdatePlayerEntries) {
			this.unsubscribeUpdatePlayerEntries();
		}
	}
});
</script>

<style scoped lang="css"></style>
