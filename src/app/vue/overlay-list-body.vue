<!-- Provides a card wrapper -->
<template>
	<VCard v-if="isCardWrapped" class="overflow-hidden w-100" :rounded="isMenu ? 'sm' : true">
		<slot />
	</VCard>

	<template v-else>
		<slot />
	</template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCard } from "vuetify/components";
import { OverlayContentType, overlayContentProps } from "./util";

export default defineComponent({
	components: {
		VCard
	},

	computed: {
		/**
		 * Whether the content is wrapped in a card.
		 *
		 * @returns Whether the content is wrapped in a card
		 */
		isCardWrapped(): boolean {
			return this.isMenu;
		},

		/**
		 * Whether the item is displayed as a menu.
		 *
		 * @returns Whether the item is displayed as a menu
		 */
		isMenu(): boolean {
			return this.contentType === OverlayContentType.Menu;
		}
	},

	props: {
		...overlayContentProps
	}
});
</script>
