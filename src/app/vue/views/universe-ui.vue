<!-- Universe UI -->
<template>
	<UniverseUiClick cell-uuid="nothing" />
	<!-- Undefined assertion since index used in iteration -->
	<UniverseUiShard
		v-for="([shardUuid, {shard}], index) in (shardEntries as ShardEntries)"
		:key="shardUuid"
		v-model="(shardEntries as ShardEntries)[index]![1].model"
		:shard="shard"
	/>
	<CompactToolbar :menus="mainToolbarMenus" />

	<OverlayWindow v-model="isDebugMenuDisplayed" icon="fa-bug-slash">
		<template #body>
			<OverlayList :items="debugWindowItems" :is-compact="false">
				<template #test> test div dom </template>
			</OverlayList>
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";
import CompactToolbar from "../compact-toolbar.vue";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuBaseProps } from "../core/compact-toolbar";
import { OverlayListItemEntry, OverlayListItemEntryType, OverlayListTabs } from "../core/overlay";
import { UniverseUiShardModel } from "../core/universe-ui";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiShard from "./universe-ui-shard.vue";

/**
 * Shard entries data type, to restore lost unref class type information.
 */
type ShardEntries = Array<
	[
		Uuid,
		{
			/**
			 * Shard.
			 */
			shard: ClientShard;

			/**
			 * Model.
			 *
			 * @remarks
			 * Single model for perhaps multiple values is used, as it is already an iteration, and individual variables would only add complexity.
			 */
			model: UniverseUiShardModel;
		}
	]
>;

export default defineComponent({
	components: { CompactToolbar, OverlayList, OverlayWindow, UniverseUiClick, UniverseUiShard },

	computed: {
		/**
		 * Tab content for debug for all shards.
		 *
		 * @returns Tab content
		 */
		debugItemsShardTabs(): OverlayListTabs {
			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			return Array.from(this.shardEntries).map(([, { shard, model }]) => {
				return {
					items: [
						{ name: "Shard UUID", type: OverlayListItemEntryType.Uuid, uuid: shard.shardUuid },
						{
							data: model.players.length.toString(),
							items: model.players.map((player, index) => {
								return {
									name: `Player ${index} UUID`,
									type: OverlayListItemEntryType.Uuid,
									uuid: player.playerUuid
								};
							}),
							name: "Players",
							type: OverlayListItemEntryType.List
						}
					],
					name: shard.shardName
				};
			});
		},

		/**
		 * Items for display in debug window.
		 *
		 * @returns Window items
		 */
		debugWindowItems(): Array<OverlayListItemEntry> {
			return [
				{
					data: this.shardEntries.length.toString(),
					name: "Shards",
					tabs: this.debugItemsShardTabs,
					type: OverlayListItemEntryType.Tab
				}
			];
		},

		isDebugMenuDisplayed: {
			/**
			 * Gets debug container display record.
			 *
			 * @returns Boolean value
			 */
			get(): boolean {
				const symbolValue: unknown = (this as unknown as ThisVueStore).$store.state.records[
					this.debugMenuDisplaySymbol
				];

				if (symbolValue) {
					return true;
				}

				return false;
			},

			/**
			 * Sets debug container display record.
			 *
			 * @param value - Boolean value to set
			 */
			set(value: boolean) {
				(this as unknown as ThisVueStore).$store.commit("recordMutation", {
					id: this.debugMenuDisplaySymbol,
					value
				});
			}
		},

		/**
		 * Menus for main toolbar.
		 *
		 * @returns Array of menus
		 */
		mainToolbarMenus(): Array<CompactToolbarMenuBaseProps> {
			return [
				{
					icon: "fa-gear",
					items: [{ clickRecordIndex: this.debugMenuDisplaySymbol, icon: "fa-bug-slash", name: "Debug" }],
					maxPinnedAmount: 0,
					name: "System"
				}
			];
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
		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			debugMenuDisplaySymbol: Symbol("debug-menu-display"),
			shardEntries: new Array() as ShardEntries,
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
				(this.shardEntries as ShardEntries).map(([shardUuid, { model }]) => {
					return [shardUuid, model];
				})
			);

			(this.shardEntries as ShardEntries) =
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
