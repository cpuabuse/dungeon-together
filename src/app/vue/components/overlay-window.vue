<!-- Dialog modal -->

<template>
	<!-- `v-show` is used to acquire refs and for performance; if `v-if`, then should be in parent component -->
	<div v-show="modelValue" ref="overlayWindow" class="overlay-window">
		<VCard class="h-100 w-100 overflow-hidden">
			<div ref="overlayWindowHandle">
				<VToolbar density="compact">
					<VIcon :icon="icon" class="ms-4" />
					<VToolbarTitle class="font-weight-bold">Title</VToolbarTitle>
					<VBtn
						size="small"
						icon="fa-thumbtack"
						:variant="isDraggable ? undefined : 'tonal'"
						@click="
							() => {
								toggleResize();
								toggleDrag();
							}
						"
					/>
					<VBtn size="small" icon="fa-x" @click="$emit('update:modelValue', false)" />
				</VToolbar>
			</div>

			<slot name="body"></slot>
		</VCard>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { VBtn, VCard, VIcon, VToolbar, VToolbarTitle } from "vuetify/components";
import { useDraggable } from "../core/draggable";

export default defineComponent({
	components: { VBtn, VCard, VIcon, VToolbar, VToolbarTitle },

	emits: ["update:modelValue"],

	name: "OverlayWindow",

	props: {
		icon: {
			default: "fa-carrot",
			type: String
		},
		modelValue: { required: true, type: Boolean }
	},

	/**
	 * Setup for refs.
	 *
	 * @returns Refs
	 */
	setup() {
		// Infer refs
		/* eslint-disable @typescript-eslint/typedef */
		const overlayWindow = ref<HTMLDivElement | null>(null);
		const overlayWindowHandle = ref<HTMLDivElement | null>(null);
		/* eslint-enable @typescript-eslint/typedef */

		return {
			overlayWindow,
			overlayWindowHandle,
			...useDraggable({ element: overlayWindow, handle: overlayWindowHandle })
		};
	}
});
</script>

<style lang="css">
.overlay-window {
	/** Needed for drag on mobile */
	touch-action: none;

	/** Needed for z-index override, multiple resize in container */
	position: absolute;

	z-index: auto;

	height: 500px;
	width: 300px;
}
</style>
