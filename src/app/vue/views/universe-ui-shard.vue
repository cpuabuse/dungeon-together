<!-- Universe UI per shard -->
<template>
	<UniverseUiShardPlayer
		v-for="[playerUuid, player ] in (playerEntries as PlayerEntries)"
		:key="playerUuid"
		:shard="shard"
		:player="player"
	/>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ThisVueStore, UniverseState } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";
import { UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiShardPlayer from "./universe-ui-shard-player.vue";

/**
 * Player entries data type, to restore lost unref class type information.
 */
type PlayerEntries = Array<[Uuid, ClientPlayer]>;

export default defineComponent({
	components: { UniverseUiShardPlayer },

	/**
	 * Created callback.
	 */
	created() {
		this.updatePlayerEntries();

		this.unsubscribe = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
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
			unsubscribe: null as (() => void) | null
		};
	},

	emits: ["update:modelValue"],

	methods: {
		/**
		 * Update player entris data.
		 */
		updatePlayerEntries(): void {
			(this.playerEntries as PlayerEntries) = Array.from(this.shard.players.entries());

			this.$emit("update:modelValue", {
				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				players: (this.playerEntries as PlayerEntries).map(([, player]) => player)
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
	 * Unmounted callback.
	 */
	unmounted() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
});
</script>

<style scoped lang="css"></style>
