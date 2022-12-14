<!-- Game control toolbar to display menus -->

<template>
	<div class="d-flex">
		<!-- To have an effect of "update" of a menu when key changes, applying absolute in CSS, since `leave-absolute` removes leave animation -->
		<VFabTransition group>
			<!-- Change of key will recreate the DOM -->
			<CompactToolbarMenu
				v-for="menuId in menuIds"
				:key="menuKeys[menuId]"
				v-bind="menus[menuId]"
				dense
				rounded
				floating
				class="ma-2"
				:is-force-collapsed="activeMenu !== menuKeys[menuId]"
				@extend="setActiveMenu({ key: menuKeys[menuId] })"
			>
			</CompactToolbarMenu>
		</VFabTransition>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VFabTransition } from "vuetify/components";
import CompactToolbarMenu from "./compact-toolbar-menu.vue";

/**
 * Root component.
 */
export default defineComponent({
	components: {
		CompactToolbarMenu,
		VFabTransition
	},

	computed: {
		/**
		 * Unique menus IDs.
		 *
		 * @remarks
		 * If there are duplicates, extra values are rejected.
		 * To be used for iterations.
		 *
		 * @returns Unique menu list
		 */
		menuIds(): Array<number> {
			return this.menuKeys.reduce<Array<number>>((result, value, index, menus) => {
				return [...result, ...(index === menus.indexOf(value) ? [index] : [])];
			}, []);
		},

		/**
		 * Keys, persistently identifying menus.
		 *
		 * @returns Unique key list
		 */
		menuKeys(): Array<string> {
			let realKeys: Array<string> = this.menus.map(
				menu => `${menu.name}/${menu.items.map(item => item.name).join("-")}`
			);

			return realKeys;
		}
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			/**
			 * Last menu that was open and kept open.
			 */
			activeMenu: null as null | string,
			menus: [
				{
					items: [{ name: "O1ne" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 2,
					name: "First"
				},
				{
					items: [{ name: "O2ne" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 1,
					name: "Second"
				},
				{
					hasLabels: false,
					items: [{ name: "O3ne" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 1,
					name: "Third"
				}
			]
		};
	},

	methods: {
		/**
		 * Sets the last extended menu unique key.
		 *
		 * @param param - Destructured parameter
		 */
		clearActiveMenu({
			key
		}: {
			/**
			 * Unique key of menu.
			 */
			key: string;
		}) {
			if (this.activeMenu === key) {
				this.activeMenu = null;
			}
		},

		/**
		 * Sets the last extended menu unique key.
		 *
		 * @param param - Destructured parameter
		 */
		setActiveMenu({
			key
		}: {
			/**
			 * Unique key of menu.
			 */
			key: string;
		}) {
			this.activeMenu = key;
		}
	}
});
</script>

<style scoped>
.fab-transition-leave-active {
	position: absolute;
}
</style>
