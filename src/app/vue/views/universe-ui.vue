<!-- Universe UI -->
<template>
	<UniverseUiClick cell-uuid="nothing" />
	<!-- Undefined assertion since index used in iteration -->

	<UniverseUiShard
		v-for="([shardUuid, {shard}], index) in (shardEntries as UniverseUiShardEntries)"
		:key="shardUuid"
		v-model="(shardEntries as UniverseUiShardEntries)[index]![1].model"
		:shard="shard"
	/>

	<UniverseUiToolbar :shard-entries="(shardEntries as UniverseUiShardEntries)" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { UniverseUiShardEntries, UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiShard from "./universe-ui-shard.vue";
import UniverseUiToolbar from "./universe-ui-toolbar.vue";

export default defineComponent({
	components: { UniverseUiClick, UniverseUiShard, UniverseUiToolbar },

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
			debugMenuDisplaySymbol: Symbol("debug-menu-display"),
			shardEntries: new Array() as UniverseUiShardEntries,
			universe: (this as unknown as ThisVueStore).$store.state.universe,
			unsubscribe: null as (() => void) | null
		};

		return data;
	},

	methods: {
		/**
		 * Update shard entries.
		 *
		 * @remarks
		 * The source values are modified outside of vue, so to use model within entries, array remapping needs to preserve model values.
		 */
		updateShardEntries(): void {
			const modelMap: Map<Uuid, UniverseUiShardModel> = new Map<Uuid, UniverseUiShardModel>(
				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				(this.shardEntries as UniverseUiShardEntries).map(([shardUuid, { model }]) => {
					return [shardUuid, model];
				})
			);

			(this.shardEntries as UniverseUiShardEntries) =
				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(this.universe.shards.entries()).map(([shardUuid, shard]) => {
					return [
						shardUuid,
						{
							model: modelMap.get(shardUuid) ?? {
								players: []
							},
							shard
						}
					];
				});
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
