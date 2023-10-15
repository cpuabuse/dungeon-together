<!-- Universe UI -->
<template>
	<UniverseUiClick :rc-menu-data="rcMenuData" />

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
import { ClientUniverseStateRcMenuData, ThisVueStore, UniverseState, UniverseStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { useOverlayBusParent } from "../core/overlay";
import { UniverseUiShardEntries, UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiShard from "./universe-ui-shard.vue";
import UniverseUiToolbar from "./universe-ui-toolbar.vue";

export default defineComponent({
	components: { UniverseUiClick, UniverseUiShard, UniverseUiToolbar },

	computed: {
		/**
		 * Right click menu data.
		 *
		 * @returns Right click menu data or `null` when to display nothing
		 */
		rcMenuData(): ClientUniverseStateRcMenuData {
			// Casting since class type information lost
			return (this.state as unknown as UniverseState).rcMenuData;
		}
	},

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
		const { state }: UniverseStore = (this as unknown as ThisVueStore).$store;

		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			debugMenuDisplaySymbol: Symbol("debug-menu-display"),

			// This value is expected to be rewritten fully on change by child nodes
			shardEntries: new Array() as UniverseUiShardEntries,
			state,
			universe: state.universe,
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
			// This is not a `computed` since it should be watched as well, essentially
			const modelMap: Map<Uuid, UniverseUiShardModel> = new Map(
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
								playerEntries: []
							},
							shard
						}
					];
				});
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
	setup() {
		return useOverlayBusParent();
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
