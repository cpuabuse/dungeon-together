<template>
	<div class="universe">Hello: {{ what }}</div>
	<tsxtest />
	<statealertbox />
	<debug />
	<CompactToolbar :menus="mainToolbarMenus" @click="mainToolbarClick" />
	<OverlayContainer>
		<template #body>
			<OverlayContainerContent
				:items="[
					{ name: 'Info1', data: '14' },
					{ name: 'Info2', data: '2' },
					{ name: 'Player', type: ItemType.Uuid, uuid: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
				]"
			/>
		</template>
	</OverlayContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../client/gui";
import { OverlayContainerItemType as ItemType } from "../common/front";
import { LogLevel } from "../core/error";
import CompactToolbar from "./compact-toolbar.vue";
import debugComponent from "./debug.vue";
import OverlayContainerContent from "./overlay-container-content.vue";
import OverlayContainer from "./overlay-container.vue";
import stateAlertBoxComponent from "./state-alert-box.vue";
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
		debug: debugComponent,
		statealertbox: stateAlertBoxComponent,
		tsxtest: tsxTestComponent
	},

	/**
	 * Computed props.
	 */
	computed: {
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
								alert("Stats clicked!");
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
								alert("Debug clicked!");
							}
						}
					],
					maxPinnedAmount: 0,
					name: "System"
				}
			]
		};

		return {
			ItemType,
			mainToolbar,
			what: 0
		};
	},

	methods: {
		/**
		 * Processes click onb main toolbar.
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
</style>
