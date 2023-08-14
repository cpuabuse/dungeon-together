<!-- Universe UI toolbar menu and windows -->
<template>
	<CompactToolbar :menus="mainToolbarMenus" />

	<OverlayWindow v-model="isDebugMenuDisplayed" icon="fa-bug-slash">
		<template #body>
			<OverlayList :items="debugWindowItems" :is-compact="false" />
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ThisVueStore } from "../../client/gui";
import CompactToolbar from "../compact-toolbar.vue";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuBaseProps } from "../core/compact-toolbar";
import { OverlayListItemEntry, OverlayListItemEntryType, OverlayListTabs } from "../core/overlay";
import { UniverseUiShardEntries } from "../core/universe-ui";

export default defineComponent({
	components: { CompactToolbar, OverlayList, OverlayWindow },

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
							items: model.players.map(player => {
								return {
									name: player.playerName,
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
				...this.shardMenus,
				{
					icon: "fa-gear",
					items: [{ clickRecordIndex: this.debugMenuDisplaySymbol, icon: "fa-bug-slash", name: "Debug" }],
					maxPinnedAmount: 0,
					name: "System"
				}
			];
		},

		/**
		 * Menus per shard.
		 *
		 * @returns Array of menus
		 */
		shardMenus(): Array<CompactToolbarMenuBaseProps> {
			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			return this.shardEntries.map(([, { shard, model }]) => {
				return {
					icon: "fa-globe",
					items: model.players.map(player => {
						return {
							clickRecordIndex: "test",
							icon: "fa-person",
							name: "Player",
							nameSubtext: player.playerName
						};
					}),
					maxPinnedAmount: 1,
					name: "Shard",
					nameSubtext: shard.shardName
				};
			});
		}
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
			universe: (this as unknown as ThisVueStore).$store.state.universe,
			unsubscribe: null as (() => void) | null
		};

		return data;
	},

	props: {
		shardEntries: {
			required: true,
			type: Array as PropType<UniverseUiShardEntries>
		}
	}
});
</script>

<style scoped lang="css"></style>
