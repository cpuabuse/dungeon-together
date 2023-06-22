<template>
	<VApp style="background: none" full-height>
		<div class="app-content">
			<div class="universe">Hello: {{ what }}</div>
			<tsxtest />
			<OverlayClick v-model="isRightClickOverlayDisplayed">
				<template #body>
					<OverlayList :items="debugOverlayItems" content-type="menu-compact" />
				</template>
			</OverlayClick>

			<statealertbox v-show="alert" />

			<!-- Overlays -->
			<div class="universe-overlay">
				<OverlayWindow v-model="debugContainer" icon="fa-bug-slash">
					<template #body>
						<OverlayList :items="debugOverlayItems" :is-compact="false">
							<template #test> test div dom </template>
						</OverlayList>
					</template>
				</OverlayWindow>

				<template v-for="shard in shards" :key="shard.shardUuid">
					<OverlayWindow
						:model-value="showStatContainers.get(shard.shardUuid) ?? false"
						@update:model-value="value => showStatContainers.set(shard.shardUuid, value)"
					>
						<template #body>
							<OverlayList :items="statsItems">
								<template #stats>
									<template
										v-for="unitUuid in Array.from(shard.players)[0]?.[1].dictionary?.units ?? []"
										:key="unitUuid"
									>
										<StatsBar
											:color="hpColor"
											name="HP"
											:value="universe.getEntity({ entityUuid: unitUuid }).tempHealth"
											:max-value="universe.getEntity({ entityUuid: unitUuid }).dictionary?.maxHealth"
										/>
										<StatsBar :color="mpColor" name="MP" />
										Stats: {{ universe.getEntity({ entityUuid: unitUuid }).dictionary?.stats }}
									</template>
								</template>
							</OverlayList>
						</template>
					</OverlayWindow>
				</template>
			</div>

			<CompactToolbar :menus="mainToolbarMenus" @click="mainToolbarClick" />
		</div>
	</VApp>
</template>

<script lang="ts">
import Color from "color";
import { defineComponent } from "vue";
import { VApp } from "vuetify/components";
import { ThisVueStore } from "../client/gui";
import { ClientShard } from "../client/shard";
import { Uuid } from "../common/uuid";
import { LogLevel } from "../core/error";
import { ElementSize } from "./common/element";
import CompactToolbar from "./compact-toolbar.vue";
import { OverlayClick, OverlayList, OverlayWindow } from "./components";
import { OverlayContentTabs, OverlayListItemEntry, OverlayListItemEntryType, OverlayType } from "./core/overlay";
import debugComponent from "./debug.vue";
import stateAlertBoxComponent from "./state-alert-box.vue";
import StatsBar from "./stats-bar.vue";
import tsxTestComponent from "./tsx/test.vue";
import {
	CompactToolbarData,
	CompactToolbarMenu,
	CompactToolbarMenuBaseProps,
	compactToolbarDataToMenuBaseProps
} from "./types";

/**
 * Root component.
 */
export default defineComponent({
	components: {
		CompactToolbar,
		OverlayClick,
		OverlayList,
		OverlayWindow,
		StatsBar,
		VApp,
		debug: debugComponent,
		statealertbox: stateAlertBoxComponent,
		tsxtest: tsxTestComponent
	},

	/**
	 * Computed props.
	 */
	computed: {
		/**
		 * To display alert or not.
		 *
		 * @returns Alert state
		 */
		alert(): boolean {
			// Casting to boolean from temporary `any`
			return (this as unknown as ThisVueStore).$store.state.records.alert as boolean;
		},

		/**
		 * Tab content for debug for all shards.
		 *
		 * @returns Tab content
		 */
		debugItemsShardTabs(): OverlayContentTabs {
			return this.shards.map((shard, index) => {
				return {
					items: [
						{ name: "shardUuid", type: OverlayListItemEntryType.Uuid, uuid: shard.shardUuid },
						{
							name: "playerUuid",
							type: OverlayListItemEntryType.Uuid,
							uuid: Array.from(shard.players)?.[0]?.[1]?.playerUuid ?? "undefined"
						}
					],
					name: shard.shardName
				};
			});
		},

		/**
		 * Overlay container items.
		 *
		 * @returns Overlay container items
		 */
		debugOverlayItems(): Array<OverlayListItemEntry> {
			return [
				{ data: "14", icon: "fa-bug-slash", name: "Info1" },
				{ data: "2", name: "Info2" },
				{ id: "switch1", name: "Switch", type: OverlayListItemEntryType.Switch },
				{ name: "Player", type: OverlayListItemEntryType.Uuid, uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
				{
					size: ElementSize.Medium,
					tabs: this.debugItemsShardTabs,
					type: OverlayListItemEntryType.Tab
				}
			];
		},

		/**
		 * Main toolbar menus.
		 *
		 * @returns Main toolbar menus
		 */
		mainToolbar(): CompactToolbarData {
			const data = this.$data;
			return {
				menus: [
					...this.playerMenus,
					{
						icon: "fa-globe",
						items: [{ name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
						maxPinnedAmount: 1,
						name: "World"
					},
					this.systemMenu
				]
			};
		},

		/**
		 * Menus to be used in main toolbar.
		 *
		 * @returns Menu array
		 */
		mainToolbarMenus(): Array<CompactToolbarMenuBaseProps> {
			return compactToolbarDataToMenuBaseProps(this.mainToolbar);
		},

		/**
		 * Player menu.
		 *
		 * @returns Player menu
		 */
		playerMenus(): Array<CompactToolbarMenu> {
			const data = this.$data;
			const that = this;
			let isNameSubtextToBeSet: boolean = this.shards.length > 0;

			return this.shards.map(shard => {
				return {
					icon: "fa-person",
					items: [
						{
							icon: "fa-id-card",

							name: "Stats",

							/**
							 * Click handler.
							 */
							onClick(): void {
								that.showStatContainers.set(shard.shardUuid, true);
							}
						},
						{ name: "Items" },
						{ name: "Three" },
						{ name: "Four" },
						{ name: shard.shardUuid }
					],
					maxPinnedAmount: 2,
					name: "Player",
					nameSubtext: isNameSubtextToBeSet ? shard.shardName : undefined
				};
			});
		},

		/**
		 * Debug menu.
		 *
		 * @returns Debug menu
		 */
		systemMenu(): CompactToolbarMenu {
			const data = this.$data;
			const store = (this as unknown as ThisVueStore).$store;
			return {
				icon: "fa-gear",
				items: [
					{ name: "One" },
					{ name: "Two" },
					{ name: "Three" },
					{
						icon: "fa-sliders",
						name: "Options",

						/**
						 * Click debug.
						 */
						onClick(): void {
							alert("Options clicked!");
						}
					},
					{
						icon: "fa-bug-slash",
						name: "Debug",

						/**
						 * Click debug.
						 */
						onClick(): void {
							data.debugContainer = true;
						}
					}
				],
				maxPinnedAmount: 0,
				name: "System"
			};
		}
	},

	/**
	 * Update timer every second.
	 */
	created() {
		setInterval(() => {
			this.$data.what = this.universe.application.state.upTime;

			// TODO: Change to update on message exchange
			this.watchShards();
		}, 1000);
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
			ItemType: OverlayListItemEntryType,
			OverlayListType: OverlayType,
			debugContainer: false,
			hpColor: new Color("#1F8C2F"),
			isRightClickOverlayDisplayed: true,
			mpColor: new Color("#051DE8"),
			shardUuids: new Array<Uuid>(),
			shards: new Array<ClientShard>(),
			showStatContainers: new Map<Uuid, boolean>(),
			statsItems: [
				{ id: "stats", name: "Stats", type: OverlayListItemEntryType.Slot },
				{ data: "1", name: "Attack" },
				{ data: "3", name: "Attack" }
			],
			universe: (this as unknown as ThisVueStore).$store.state.universe,
			what: 0
		};

		return data;
	},

	methods: {
		/**
		 * Processes click on main toolbar.
		 *
		 * @param param - Destructured object parameter
		 */
		mainToolbarClick({
			menuId,
			itemId
		}: {
			/**
			 * Menu ID.
			 */
			menuId: number;

			/**
			 * Item ID.
			 */
			itemId: number;
		}) {
			this.universe.log({
				level: LogLevel.Informational,
				message: `Clicked on main menu(menuId="${menuId}", itemId="${itemId}")`
			});
			let onClick: undefined | (() => void) = this.mainToolbar.menus[menuId].items[itemId]?.onClick;
			if (onClick) {
				onClick();
			} else {
				this.universe.log({
					level: LogLevel.Error,
					message: `Click callback does not exist in menu(menuId="${menuId}", itemId="${itemId}")`
				});
			}
		},

		/**
		 * Checks for changes in universe shards map, and updates if necessary.
		 *
		 * @remarks
		 * Map is controlled by the universe, so we can't just watch it, and have to periodically check for changes.
		 */
		watchShards() {
			const shardsMap = this.universe.shards;

			if (this.shardUuids.some(shardUuid => !shardsMap.has(shardUuid)) || this.shardUuids.length !== shardsMap.size) {
				this.universe.log({
					level: LogLevel.Informational,
					message: `Universe shards changed.`
				});

				this.shardUuids = Array.from(shardsMap.keys());
				this.shards = Array.from(shardsMap.values());

				// TODO: Clear per shard state
			}
		}
	}
});
</script>

<style lang="css">
.universe {
	color: red;
}

.universe-overlay {
	position: absolute;
	width: 100%;
	height: 100%;
}

.app-content {
	position: absolute;
	top: 0;
	display: flex;
	flex-direction: column-reverse;
	width: 100%;
	height: 100%;
}
</style>
