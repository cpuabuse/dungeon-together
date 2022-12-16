<!-- Game control toolbar to display menus -->

<template>
	<div class="d-flex justify-center">
		<!-- To have an effect of "update" of a menu when key changes, applying absolute in CSS, since `leave-absolute` removes leave animation -->
		<VFabTransition group>
			<!-- Change of key will recreate the DOM -->
			<CompactToolbarMenu
				v-for="menuId in menuIds"
				:key="menuKeys[menuId]"
				v-bind="menus[menuId]"
				floating
				class="ma-2"
				:is-force-collapsed="autoCollapse && activeMenu !== menuKeys[menuId]"
				:has-labels="hasLabels"
				:is-highlighted-on-open="isHighlightedOnOpen"
				@extend="setActiveMenu({ key: menuKeys[menuId] })"
				@click="({ itemId }) => clickItem({ menuId, itemId })"
			>
			</CompactToolbarMenu>
		</VFabTransition>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VFabTransition } from "vuetify/components";
import CompactToolbarMenu from "./compact-toolbar-menu.vue";
import { CompactToolbarMenuBaseProps, compactToolbarSharedMenuProps } from "./types";

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
			activeMenu: null as null | string
		};
	},

	emits: ["click"],

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
		 * Process item clicked.
		 *
		 * @param id - Item id
		 */
		clickItem({
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
			this.$emit("click", { itemId, menuId });
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
	},

	props: {
		...compactToolbarSharedMenuProps,

		autoCollapse: {
			default: true,
			type: Boolean
		},

		/**
		 * List of menus.
		 */
		menus: {
			required: true,
			type: Array as PropType<Array<CompactToolbarMenuBaseProps>>
		}
	}
});
</script>

<style scoped>
/** `leave-absolute` does not work well */
.fab-transition-leave-active {
	position: absolute;
}
</style>
