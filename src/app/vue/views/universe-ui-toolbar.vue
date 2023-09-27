<!-- Universe UI toolbar menu and windows -->
<template>
	<CompactToolbar :menus="mainToolbarMenus" />
	<StoryNotification />

	<UniverseUiToolbarOptions v-model="optionsModel" />

	<OverlayWindow v-model="isDebugMenuDisplayed" icon="fa-bug-slash" :name="debugName">
		<template #body>
			<OverlayList :items="debugWindowItems" :is-compact="false">
				<template #uuid-search> <UuidSearch /> </template>
			</OverlayList>
		</template>
	</OverlayWindow>

	<!-- Non null assertion since access from iteration -->
	<OverlayWindow
		v-for="(
			[
				playerUuid,
				{
					playerEntry: {
						model: { dictionary }
					},
					items
				}
			],
			index
		) in (playerEntries as PlayerEntries)"
		:key="playerUuid"
		v-model="playerEntries[index]![1].isPlayerMenuDisplayed"
	>
		<template #body>
			Player dictionary: {{ dictionary }}
			<OverlayList :items="items"></OverlayList>
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
import Color from "color";
import { PropType, defineComponent } from "vue";
import { ThisVueStore, UniverseStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { CoreDictionary } from "../../core/connection";
import CompactToolbar from "../compact-toolbar.vue";
import { OverlayList, OverlayWindow } from "../components";
import StoryNotification from "../components/story-notification.vue";
import UuidSearch from "../components/uuid-search.vue";
import { CompactToolbarMenuBaseProps } from "../core/compact-toolbar";
import { useLocale } from "../core/locale";
import { OverlayListItemEntry, OverlayListItemEntryType, OverlayListItems, OverlayListTabs } from "../core/overlay";
import { useRecords } from "../core/store";
import { UniverseUiPlayerEntry, UniverseUiShardEntries } from "../core/universe-ui";
import UniverseUiToolbarOptions from "./universe-ui-toolbar-options.vue";

/**
 * Local player entry type.
 */
type PlayerEntry = {
	/**
	 * Client player.
	 */
	playerEntry: UniverseUiPlayerEntry;

	/**
	 * Record index for player menu.
	 */
	clickRecordIndex: symbol | string;

	/**
	 * To display menu or not.
	 */
	isPlayerMenuDisplayed: boolean;

	/**
	 * Items for player menu.
	 */
	items: OverlayListItems;
};

/**
 * Helper type for casting to player entries array element, as class information lost.
 */
type PlayerEntries = Array<[string, PlayerEntry]>;

export default defineComponent({
	components: {
		CompactToolbar,
		OverlayList,
		OverlayWindow,
		StoryNotification,
		UniverseUiToolbarOptions,
		UuidSearch
	},

	computed: {
		/**
		 * Tab content for debug for all shards.
		 *
		 * @returns Tab content
		 */
		debugItemsShardTabs(): OverlayListTabs {
			return Array.from(this.shardEntries).map(
				// False negative
				/* eslint-disable @typescript-eslint/typedef */
				([
					,
					{
						shard,
						model: { playerEntries }
					}
				]) => {
					/* eslint-enable @typescript-eslint/typedef */
					return {
						items: [
							{ name: "Shard UUID", type: OverlayListItemEntryType.Uuid, uuid: shard.shardUuid },
							{
								data: playerEntries.length.toString(),
								// False negtative
								// eslint-disable-next-line @typescript-eslint/typedef
								items: playerEntries.map(([, { player }]) => {
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
				}
			);
		},

		/**
		 * Debug window title.
		 *
		 * @returns Title
		 */
		debugName(): string {
			return this.t("menuTitle.debug");
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
				},
				{
					id: "uuid-search",
					name: "UUID Search",
					type: OverlayListItemEntryType.Slot
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
				const symbolValue: unknown = this.records[this.debugMenuDisplaySymbol];

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
				this.records[this.debugMenuDisplaySymbol] = value;
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
					items: [
						...this.optionsModel.menuItems,
						{ clickRecordIndex: this.debugMenuDisplaySymbol, icon: "fa-bug-slash", name: this.debugName }
					],
					maxPinnedAmount: 1,
					name: this.system
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
			return new Map(this.playerEntries as PlayerEntries);
		},

		/**
		 * Player Icon.
		 *
		 * @returns Player icon
		 */
		playerIcon(): string {
			return this.t("menuTitle.player");
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
						model: { playerEntries }
					}
					/* eslint-enable @typescript-eslint/typedef */
				]) => {
					return {
						icon: "fa-globe",
						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						items: playerEntries.map(([, { player }]) => {
							const { userAliasDisplayName }: CoreDictionary = player.dictionary;
							let nameSubtext: string = player.playerName;
							if (typeof userAliasDisplayName === "string" && userAliasDisplayName.length > 0) {
								nameSubtext = userAliasDisplayName;
							}
							return {
								clickRecordIndex: this.playerEntriesMap.get(player.playerUuid)?.clickRecordIndex,
								icon: "fa-person",
								name: this.playerIcon,
								nameSubtext
							};
						}),
						maxPinnedAmount: 1,
						name: "Shard",
						nameSubtext: shard.shardName
					};
				}
			);
		},

		/**
		 * Item for stat box.
		 *
		 * @returns Item entry
		 */
		statItem(): OverlayListItemEntry {
			return {
				id: "stats",
				name: "Stats",
				type: OverlayListItemEntryType.Slot
			};
		},

		/**
		 * System.
		 *
		 * @returns System
		 */
		system(): string {
			return this.t("menuTitle.system");
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

			hpColor: new Color("#1F8C2F"),

			optionsModel: { menuItems: [], windowItems: [] },

			playerEntries: new Array() as PlayerEntries,

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

	/**
	 * Setup script.
	 *
	 * @returns Records
	 */
	setup() {
		return { ...useRecords(), ...useLocale() };
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
				(this.playerEntries as PlayerEntries) = shardEntries
					.map(
						// False negative
						/* eslint-disable @typescript-eslint/typedef */
						([
							,
							{
								model: { playerEntries }
							}
							/* eslint-enable @typescript-eslint/typedef */
						]) => {
							// False negative
							// eslint-disable-next-line @typescript-eslint/typedef
							return playerEntries.map(([playerUuid, playerEntry]) => {
								/**
								 * Generates an entry.
								 *
								 * @remarks
								 * Arrow, to access store.
								 *
								 * @returns An object with index and model getter/setter
								 */
								const generateEntryValue: () => PlayerEntry = () => {
									const { records }: Record<"records", UniverseStore["state"]["records"]> = this;

									let clickRecordIndex: symbol = Symbol(`Menu for player(playerUuid="${playerUuid}")`);

									return {
										clickRecordIndex,

										/**
										 * Getter for player menu display model.
										 *
										 * @returns To display or not
										 */
										get isPlayerMenuDisplayed(): boolean {
											return !!records[clickRecordIndex];
										},

										/**
										 * Setter for player menu displayed model.
										 */
										// Infers from getter
										// eslint-disable-next-line @typescript-eslint/typedef
										set isPlayerMenuDisplayed(value) {
											records[clickRecordIndex] = value;
										},

										items: [this.statItem],

										playerEntry
									};
								};

								let result: [string, PlayerEntry] = [
									playerUuid,
									this.playerEntriesMap.get(playerUuid) ?? generateEntryValue()
								];

								return result;
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
