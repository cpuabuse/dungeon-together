<template>
	<VMenu>
		<template #activator="{ props }">
			<VBtn class="OverlayDropdown" color="primary" v-bind="props"> Right-click </VBtn>
		</template>
		<VList>
			<VListItem v-for="(item, index) in items" :key="index" :value="index">
				<VListItemTitle>{{ item.title }}</VListItemTitle>
			</VListItem>
		</VList>
	</VMenu>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VBtn, VList, VListItem, VListItemTitle, VMenu } from "vuetify/components";

export default defineComponent({
	components: {
		VBtn,
		VList,
		VListItem,
		VListItemTitle,
		VMenu
	},

	/**
	 * Data to be displayed in the menu.
	 *
	 * @returns Menu data.
	 */
	data: () => ({
		items: [{ title: "Option 1" }, { title: "Option 2" }, { title: "Option 3" }, { title: "Option 4" }]
	}),

	props: {
		zIdx: {
			default: 0,
			type: Number
		}
	}
});
</script>

<style scoped>
.OverlayDropdown {
	position: absolute;
	top: 100px;
	left: 100px;
}
</style>
