<!-- Dialog modal -->

<template>
	<!-- Width must be set in dialog, since it defines dialog area -->
	<VDialog
		:model-value="modelValue"
		no-click-animation
		persistent
		:scrim="false"
		width="50vw"
		height="50vh"
		@update:model-value="value => $emit('update:modelValue', value)"
	>
		<VCard height="100%" width="100%" class="overflow-hidden">
			<VToolbar height="40">
				<VIcon icon="fa-tools" class="ml-4" />
				<VToolbarTitle class="text-h5 font-weight-bold">Title</VToolbarTitle>
				<VBtn icon @click="$emit('update:modelValue', false)">
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
		return {};
	},

	emits: ["update:modelValue"],

	props: { modelValue: { required: true, type: Boolean } }
});
</script>
