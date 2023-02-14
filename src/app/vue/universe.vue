<template>
	<VApp style="background: none">
		<div class="app-content">
			<div class="universe">Hello: {{ what }}</div>
			<tsxtest />
			<statealertbox v-show="alert" />
			<debug />
			<CompactToolbar :menus="mainToolbarMenus" @click="mainToolbarClick" />
			<OverlayContainer v-model="statsContainer">
				<template #body>
					<OverlayContainerContent :items="statsItems">
						<template #stats>
							<StatsBar />
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
		</div>
	</VApp>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VApp } from "vuetify/components";
import { ThisVueStore } from "../client/gui";
import { OverlayContainerItemType as ItemType } from "../common/front";
import { LogLevel } from "../core/error";
import CompactToolbar from "./compact-toolbar.vue";
import debugComponent from "./debug.vue";
import OverlayContainerContent from "./overlay-container-content.vue";
import OverlayContainer from "./overlay-container.vue";
import stateAlertBoxComponent from "./state-alert-box.vue";
import StatsBar from "./stats-bar.vue";
import tsxTestComponent from "./tsx/test.vue";
import { CompactToolbarData, CompactToolbarMenuBaseProps, compactToolbarDataToMenuBaseProps } from "./types";

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
		let mainToolbar: CompactToolbarData = {
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
				{
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
				}
			]
		};

		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			ItemType,
			debugContainer: false,
			mainToolbar,
			overlayItems: [
				{ data: "14", name: "Info1" },
				{ data: "2", name: "Info2" },
				{ name: "Player", type: ItemType.Uuid, uuid: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
				{
					tabs: [
						{
							items: [
								{ id: "alert", name: "Info1", type: ItemType.Switch },
								{ data: "5", name: "Info2" },
								{ id: "test", name: "Test", type: ItemType.Slot }
							],
							name: "Tab1"
						},
						{
							items: [
								{ data: "14", name: "Info1" },
								{ data: "2", name: "Info2" }
							],
							name: "Tab2"
						}
					],
					type: ItemType.Tab
				}
			],
			statsContainer: false,
			statsItems: [
				{ id: "stats", name: "Stats", type: ItemType.Slot },
				{ data: "1", name: "Attack" },
				{ data: "3", name: "Attack" }
			],
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
