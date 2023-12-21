<!-- Universe UI toolbar menu and windows -->
<template>
	<CompactToolbar :menus="mainToolbarMenus" />

	<UniverseUiToolbarOptions @update-menu-items="onUpdateMenuItems" />

	<!-- Overlays display -->
	<OverlayWindow
		v-for="({ listItems, name }, displayItemKey) in displayItems"
		:key="displayItemKey"
		v-model="displayItems[displayItemKey]!.isDisplayed"
		:name="name"
	>
		<template #body>
			<OverlayList :items="listItems">
				<!-- All story -->
				<template #welcome>
					<UniverseUiToolbarWelcome />
				</template>
			</OverlayList>
		</template>
	</OverlayWindow>

	<OverlayWindow v-model="isDebugMenuDisplayed" icon="fa-bug-slash" :name="debugName">
		<template #body>
			<OverlayList :items="debugWindowItems" :is-compact="false">
				<template #uuid-search> <UuidSearch /> </template>
			</OverlayList>
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
import Color from "color";
import { PropType, computed, defineComponent } from "vue";
import { Uuid } from "../../common/uuid";
import CompactToolbar from "../compact-toolbar.vue";
import { OverlayList, OverlayWindow } from "../components";
import UuidSearch from "../components/uuid-search.vue";
import {
	CompactToolbarMenu,
	CompactToolbarMenuBaseProps,
	CompactToolbarMenuItem,
	OverlayBusToCompactToolbarMenuSource,
	useOverlayBusToCompactToolbarMenuSource
} from "../core/compact-toolbar";
import { UsedLocale, useLocale } from "../core/locale";
import {
	OverlayBusSource,
	OverlayListItemEntry,
	OverlayListItemEntryType,
	OverlayListItems,
	OverlayListTabs,
	useOverlayBusConsumer,
	useOverlayBusSource
} from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { UniverseUiPlayerEntry, UniverseUiShardEntries } from "../core/universe-ui";
import UniverseUiToolbarOptions from "./universe-ui-toolbar-options.vue";
import UniverseUiToolbarWelcome from "./universe-ui-toolbar-welcome.vue";

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
		UniverseUiToolbarOptions,
		UniverseUiToolbarWelcome,
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
					data: Array.from(this.shardEntries).length.toString(),
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
				const symbolValue: unknown = this.recordStore.records[this.debugMenuDisplaySymbol];

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
				this.recordStore.records[this.debugMenuDisplaySymbol] = value;
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
					items: [{ clickRecordIndex: this.debugMenuDisplaySymbol, icon: "fa-bug-slash", name: this.debugName }],
					maxPinnedAmount: 1,
					name: "SystemR"
				},
				this.systemMenu
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

			playerEntries: new Array() as PlayerEntries,

			unsubscribe: null as (() => void) | null
		};

		return data;
	},

	props: {
		shardEntries: {
			required: true,
			type: Map as PropType<UniverseUiShardEntries>
		},
		shardMenus: {
			required: true,
			type: Array as PropType<Array<CompactToolbarMenu>>
		}
	},

	/**
	 * Setup script.
	 *
	 * @param props - Component props
	 * @param param - Context
	 * @returns Records
	 */
	// Infer setup param type
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		const stores: Stores = useStores();
		const { t }: UsedLocale = useLocale();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();
		const { universe }: Store<StoreWord.Universe> = stores.useUniverseStore();
		const welcomeOverlaySymbol: symbol = Symbol(`menu-universe-ui-toolbar-${universe.universeUuid}`);
		const welcomeDisplaySymbol: symbol = Symbol(`click-welcome-${universe.universeUuid}`);
		// Infer composable
		// eslint-disable-next-line @typescript-eslint/typedef
		let usedOverlayBusConsumer = useOverlayBusConsumer();
		const { displayItems }: OverlayBusSource = useOverlayBusSource({
			emit,
			menuItemsRegistryIndex: welcomeOverlaySymbol,
			overlayItems: [
				// Welcome screen
				{
					listItems: computed(() => {
						return [{ id: "welcome", type: OverlayListItemEntryType.Slot }] satisfies OverlayListItems;
					}),
					menuItem: computed(() => {
						return {
							clickRecordIndex: welcomeDisplaySymbol,
							icon: "fa-door-open",
							name: "Welcome"
						} satisfies CompactToolbarMenuItem;
					})
				}
			],
			recordStore,
			usedOverlayBusConsumer
		});
		// Display menu at start
		recordStore.records[welcomeDisplaySymbol] = true;

		const { menu: systemMenu }: OverlayBusToCompactToolbarMenuSource = useOverlayBusToCompactToolbarMenuSource({
			emit,
			icon: "fa-gear",
			isEmittingUpdateMenu: false,
			maxPinnedAmount: 1,
			name: t("menuTitle.system"),
			usedOverlayBusConsumer
		});

		return { displayItems, recordStore, systemMenu, t, universe, ...usedOverlayBusConsumer };
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
				(this.playerEntries as PlayerEntries) = Array.from(shardEntries)
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
									const { recordStore }: Record<"recordStore", Store<StoreWord.Record>> = this;

									let clickRecordIndex: symbol = Symbol(`Menu for player(playerUuid="${playerUuid}")`);

									return {
										clickRecordIndex,

										/**
										 * Getter for player menu display model.
										 *
										 * @returns To display or not
										 */
										get isPlayerMenuDisplayed(): boolean {
											return !!recordStore.records[clickRecordIndex];
										},

										/**
										 * Setter for player menu displayed model.
										 */
										// Infers from getter
										// eslint-disable-next-line @typescript-eslint/typedef
										set isPlayerMenuDisplayed(value) {
											recordStore.records[clickRecordIndex] = value;
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
