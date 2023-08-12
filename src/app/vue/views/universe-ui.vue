<!-- Universe UI -->
<template>
	<UniverseUiClick cell-uuid="nothing" />
	<UniverseUiShard v-for="[shardUuid, shard] in (shardEntries as ShardEntries)" :key="shardUuid" :shard="shard" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiShard from "./universe-ui-shard.vue";

/**
 * Shard entries data type, to restore lost unref class type information.
 */
type ShardEntries = Array<[Uuid, ClientShard]>;

export default defineComponent({
	components: { UniverseUiClick, UniverseUiShard },

	/**
	 * Created callback.
	 */
	created() {
		// Init entries
		this.updateShardEntries();

		// Update entries
		this.unsubscribe = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updateUniverse") {
				this.updateShardEntries();
			}
		});
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			shardEntries: new Array() as ShardEntries,
			universe: (this as unknown as ThisVueStore).$store.state.universe,
			unsubscribe: null as (() => void) | null
		};

		return data;
	},

	methods: {
		/**
		 * Update shard entries.
		 */
		updateShardEntries(): void {
			this.shardEntries = Array.from(Array.from(this.universe.shards.entries()));
		}
	},

	/**
	 * Unmounted hook.
	 */
	unmounted() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
});
</script>

<style scoped lang="css"></style>
