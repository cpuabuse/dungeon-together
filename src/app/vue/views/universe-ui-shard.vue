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
		@update-menu-items="onUpdateMenuItems"
	/>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";
import {
	UsedOverlayBusToCompactToolbarMenuSource,
	overlayBusToCompactToolbarMenuEmits,
	useOverlayBusToCompactToolbarMenuSource
} from "../core/compact-toolbar";
import { useOverlayBusConsumer } from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { PlayerEntries, UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiShardPlayer from "./universe-ui-shard-player.vue";

export default defineComponent({
	components: { UniverseUiShardPlayer },

	/**
	 * Created callback.
	 */
	created() {
		this.universeStore.onUpdateUniverse({
			/**
			 * Callback on universe update.
			 */
			callback: () => {
				this.updatePlayerEntries();
			},
			isImmediate: true
		});
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return {
			playerEntries: new Array() as PlayerEntries
		};
	},

	emits: ["update:modelValue", ...overlayBusToCompactToolbarMenuEmits],

	methods: {
		/**
		 * Method to shift player notifications.
		 *
		 * @param player - Player
		 */
		onShiftPlayerNotifications(player: ClientPlayer): void {
			// We are mutating notifications which is not directly a player prop
			// eslint-disable-next-line vue/no-mutating-props
			player.statusNotifications.shift();
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
		const stores: Stores = useStores();
		const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();

		// Infer composable return
		// eslint-disable-next-line @typescript-eslint/typedef
		let usedOverlayBusConsumer = useOverlayBusConsumer();

		// Infer composable return
		let usedOverlayBusToCompactToolbarMenuSource: UsedOverlayBusToCompactToolbarMenuSource =
			useOverlayBusToCompactToolbarMenuSource({
				emit,
				icon: "fa-globe",
				isEmittingUpdateMenu: true,
				name: "Shard",
				nameSubtext: props.shard.shardName,
				usedOverlayBusConsumer
			});

		return { ...usedOverlayBusConsumer, ...usedOverlayBusToCompactToolbarMenuSource, universeStore };
	}
});
</script>

<style scoped lang="css"></style>
