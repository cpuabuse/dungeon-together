<template>
	<VApp style="background: none">
		<div class="app-content">
			<div class="universe">Hello: {{ what }}</div>
			<tsxtest />
			<statealertbox v-show="alert" />
			<CompactToolbar :menus="mainToolbarMenus" @click="mainToolbarClick" />
			<OverlayContainer v-model="statsContainer">
				<template #body>
					<OverlayContainerContent :items="statsItems">
						<template #stats>
							<StatsBar :color="hpColor" name="HP" value="33" />
							<StatsBar :color="mpColor" name="MP" />
						</template>
					</OverlayContainerContent>
				</template>
			</OverlayContainer>
			<OverlayContainer v-model="debugContainer">
				<template #body>
					<OverlayContainerContent :items="overlayItems">
						<template #test> test div dom </template>
					</OverlayContainerContent>
				</template>
			</OverlayContainer>
			<template v-for="(shard, shardKey) in shards" :key="shardKey">
				<OverlayContainer
					:model-value="showStatContainers.get(shard.shardUuid)"
					@update:model-value="value => showStatContainers.set(shard.shardUuid, value)"
				>
					<template #body>
						<OverlayContainerContent :items="statsItems">
							<template #stats>
								<template v-for="unitUuid in shard.dictionary.units" :key="unitUuid">
									<StatsBar :color="hpColor" name="HP" :value="33" />
									<StatsBar :color="mpColor" name="MP" />
								</template>
							</template>
						</OverlayContainerContent>
					</template>
				</OverlayContainer>
			</template>
		</div>
	</VApp>
</template>

<script lang="ts">
import Color from "color";
import { defineComponent } from "vue";
import { VApp } from "vuetify/components";
import { ThisVueStore } from "../client/gui";
import { ClientShard } from "../client/shard";
import { OverlayContainerItemType as ItemType } from "../common/front";
import { Uuid } from "../common/uuid";
import { LogLevel } from "../core/error";
import CompactToolbar from "./compact-toolbar.vue";
import debugComponent from "./debug.vue";
import OverlayContainerContent from "./overlay-container-content.vue";
import OverlayContainer from "./overlay-container.vue";
import stateAlertBoxComponent from "./state-alert-box.vue";
import StatsBar from "./stats-bar.vue";
import tsxTestComponent from "./tsx/test.vue";
import {
	CompactToolbarData,
	CompactToolbarMenuBaseProps,
	ElementSize,
	compactToolbarDataToMenuBaseProps,
	OverlayContainerContentTabs,
	OverlayContainerContentItem,
	CompactToolbarMenu
} from "./types";

/**
 * Root component.
 */
export default defineComponent({
	components: {
		CompactToolbar,
		OverlayContainer,
		OverlayContainerContent,
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

		debugItemsShardTabs(): OverlayContainerContentTabs {
			return this.shards.map((shard, index) => {
				return {
					items: [
						{ name: "shardUuid", type: ItemType.Uuid, uuid: shard.shardUuid },
						{ name: "playerUuid", type: ItemType.Uuid, uuid: shard.playerUuid }
					],
					name: index.toString()
				};
			});
		},

		overlayItems(): Array<OverlayContainerContentItem> {
			return [
				{ data: "14", name: "Info1" },
				{ data: "2", name: "Info2" },
				{ name: "Player", type: ItemType.Uuid, uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
				{
					size: ElementSize.Medium,
					tabs: this.debugItemsShardTabs,
					type: ItemType.Tab
				}
			];
		},

		/**
		 * Debug menu.
		 *
		 * @returns Debug menu
		 */
		debugMenu(): CompactToolbarMenu {
			const data = this.$data;
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
		},

		shards(): Array<ClientShard> {
			return Array.from((this as unknown as ThisVueStore).$store.state.universe.shards).map(([, shard]) => shard);
		},

		mainToolbar(): CompactToolbarData {
			const data = this.$data;
			return {
				menus: [
					{
						icon: "fa-person",
						items: [
							{
								icon: "fa-id-card",

								name: "Stats",

								/**
								 * Click handler.
								 */
								onClick(): void {
									data.statsContainer = true;
								}
							},
							{ name: "Items" },
							{ name: "Three" },
							{ name: "Four" },
							{ name: "Five" }
						],
						maxPinnedAmount: 2,

						name: "Player"
					},
					{
						icon: "fa-globe",
						items: [{ name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
						maxPinnedAmount: 1,
						name: "World"
					},
					this.debugMenu
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
		}
	},

	/**
	 * Update timer every second.
	 */
	created() {
		setInterval(() => {
			this.$data.what = (this as unknown as ThisVueStore).$store.state.universe.application.state.upTime;
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
			ItemType,
			debugContainer: false,
			hpColor: new Color("#1F8C2F"),
			mpColor: new Color("#051DE8"),
			statsContainer: false,
			statsItems: [
				{ id: "stats", name: "Stats", type: ItemType.Slot },
				{ data: "1", name: "Attack" },
				{ data: "3", name: "Attack" }
			],
			what: 0,
			showStatContainers: new Map<Uuid, boolean>()
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
			(this as unknown as ThisVueStore).$store.state.universe.log({
				level: LogLevel.Informational,
				message: `Clicked on main menu(menuId="${menuId}", itemId="${itemId}")`
			});
			let onClick: undefined | (() => void) = this.mainToolbar.menus[menuId].items[itemId]?.onClick;
			if (onClick) {
				onClick();
			} else {
				(this as unknown as ThisVueStore).$store.state.universe.log({
					level: LogLevel.Error,
					message: `Click callback does not exist in menu(menuId="${menuId}", itemId="${itemId}")`
				});
			}
		}
	}
});
</script>

<style lang="css">
.universe {
	color: red;
}

.app-content {
	position: fixed;
	bottom: 0;
	right: 0;
	width: 100%;
}
</style>
