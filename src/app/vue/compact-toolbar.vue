<!-- Game control toolbar to display menus -->

<template>
	<div class="d-flex">
		<VFabTransition group leave-absolute hide-on-leave>
			<CompactToolbarMenu
				v-for="(menu, toolbarKey) in menus"
				:key="toolbarKey"
				dense
				rounded
				floating
				class="ma-2"
				v-bind="menu"
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

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			menus: [
				{
					items: [{ name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 2,
					name: "First"
				},
				{
					items: [{ name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 1,
					name: "Second"
				},
				{
					items: [{ name: "One" }, { name: "Two" }, { name: "Three" }, { name: "Four" }, { name: "Five" }],
					maxPinnedAmount: 1,
					name: "Third"
				}
			]
		};
	}
});
</script>
