<!-- Universe UI toolbar menu and windows -->
<template>
	<CompactToolbar :menus="mainToolbarMenus" />

	<OverlayWindow v-model="isDebugMenuDisplayed" icon="fa-bug-slash">
		<template #body>
			<OverlayList :items="debugWindowItems" :is-compact="false" />
		</template>
	</OverlayWindow>

	<!-- Non null assertion since access from iteration -->
	<OverlayWindow
		v-for="([playerUuid], index) in playerEntries"
		:key="playerUuid"
		v-model="playerEntries[index]![1].isPlayerMenuDisplayed"
	>
		<template #body> Test </template>
	</OverlayWindow>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ThisVueStore, UniverseStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import CompactToolbar from "../compact-toolbar.vue";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuBaseProps } from "../core/compact-toolbar";
import { OverlayListItemEntry, OverlayListItemEntryType, OverlayListTabs } from "../core/overlay";
import { UniverseUiShardEntries } from "../core/universe-ui";

/**
 * Local player entry type.
 */
type PlayerEntry = {
	/**
	 * Client player.
	 */
	player: ClientPlayer;

	/**
	 * Record index for player menu.
	 */
	clickRecordIndex: symbol | string;

	/**
	 * To display menu or not.
	 */
	isPlayerMenuDisplayed: boolean;
};

/**
 * Helper type for casting to player entries array element, as class information lost.
 */
type PlayerEntriesElement = readonly [string, PlayerEntry];

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
		 * Map of player entries.
		 * Needed for caching in between updates of player entries.
		 *
		 * @returns Map
		 */
		playerEntriesMap(): Map<Uuid, PlayerEntry> {
			return new Map(this.playerEntries as Array<PlayerEntriesElement>);
		},

		/**
		 * Menus per shard.
		 *
		 * @returns Array of menus
		 */
		shardMenus(): Array<CompactToolbarMenuBaseProps> {
			// False negative
			/* eslint-disable @typescript-eslint/typedef */
			return this.shardEntries.map(
				([
					,
					{
						shard,
						model: { players }
					}
					/* eslint-enable @typescript-eslint/typedef */
				]) => {
					return {
						icon: "fa-globe",
						items: players.map(player => {
							return {
								clickRecordIndex: this.playerEntriesMap.get(player.playerUuid)?.clickRecordIndex,
								icon: "fa-person",
								name: "Player",
								nameSubtext: player.playerName
							};
						}),
						maxPinnedAmount: 1,
						name: "Shard",
						nameSubtext: shard.shardName
					};
				}
			);
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
			playerEntries: new Array<PlayerEntriesElement>(),
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
	},

	watch: {
		shardEntries: {
			/**
			 * Player UUID watcher.
			 *
			 * @remarks
			 * Shard entries value would be changed when players change.
			 * Player entries map would be updated on it's own as it is computed, and depends on player entries modified here.
			 *
			 * @param shardEntries - New value
			 */
			handler(shardEntries: UniverseUiShardEntries): void {
				(this.playerEntries as Array<PlayerEntriesElement>) = shardEntries
					.map(
						// False negative
						/* eslint-disable @typescript-eslint/typedef */
						([
							,
							{
								model: { players }
							}
							/* eslint-enable @typescript-eslint/typedef */
						]) => {
							return players.map(player => {
								/**
								 * Generates an entry.
								 *
								 * @remarks
								 * Arrow, to access store.
								 *
								 * @returns An object with index and model getter/setter
								 */
								const generateEntryValue: () => PlayerEntriesElement[1] = () => {
									const store: UniverseStore = (this as unknown as ThisVueStore).$store;

									let clickRecordIndex: symbol = Symbol(`Menu for player(playerUuid="${player.playerUuid}")`);

									return {
										clickRecordIndex,
										/**
										 * Getter for player menu display model.
										 *
										 * @returns To display or not
										 */
										get isPlayerMenuDisplayed(): boolean {
											return !!store.state.records[clickRecordIndex];
										},

										/**
										 * Setter for player menu displayed model.
										 */
										// Infers from getter
										// eslint-disable-next-line @typescript-eslint/typedef
										set isPlayerMenuDisplayed(value) {
											store.commit("recordMutation", {
												id: clickRecordIndex,
												value
											});
										},

										player
									};
								};

								return [
									player.playerUuid,
									this.playerEntriesMap.get(player.playerUuid) ?? generateEntryValue()
								] as const;
							});
						}
					)
					.flat();
			}
		}
	}
});
</script>

<style scoped lang="css"></style>
