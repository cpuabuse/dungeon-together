<!-- Dialog modal -->

<template>
	<VBtn @click="dialog = true">Button</VBtn>

	<VDialog v-model="dialog">
		<VCard>
			<VToolbar>
				<VToolbarTitle>Title</VToolbarTitle>
				<VBtn icon @click="dialog = false">
					<VIcon icon="fa-close" />
				</VBtn>
			</VToolbar>
			<slot name="body"></slot>
		</VCard>
	</VDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VBtn, VCard, VDialog, VIcon, VToolbar, VToolbarTitle } from "vuetify/components";

export default defineComponent({
	components: { VBtn, VCard, VDialog, VIcon, VToolbar, VToolbarTitle },

	/**
	 * Data for component.
	 *
	 * @returns Component data
	 */
	data() {
		return { dialog: false };
	}
});
</script>
