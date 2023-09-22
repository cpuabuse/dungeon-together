<!-- Dialog modal -->

<template>
	<!-- Need a block display wrapper for draggable; Will also have fixed direction, so that transform doesn't move window, child locale provide will revert it back -->
	<div class="overlay-window-block">
		<VLocaleProvider>
			<!-- `v-show` is used to acquire refs and for performance; if `v-if`, then should be in parent component -->
			<div v-show="modelValue" ref="overlayWindow" class="overlay-window">
				<VCard class="h-100 w-100 overflow-hidden">
					<div ref="overlayWindowHandle">
						<!-- Compact density always, to preserve intended ratio -->
						<VToolbar density="compact">
							<BaseIcon v-if="icon || modeUuid" :icon="icon" :mode-uuid="modeUuid" class="ms-4" />
							<VToolbarTitle v-if="name" class="font-weight-bold overlay-window-toolbar-title">{{
								name
							}}</VToolbarTitle>
							<VSpacer />
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
		</VLocaleProvider>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { VBtn, VCard, VIcon, VLocaleProvider, VSpacer, VToolbar, VToolbarTitle } from "vuetify/components";
import { useDraggable } from "../core/draggable";
import { overlayListItemNarrowProps } from "../core/overlay";
import { BaseIcon } from ".";

export default defineComponent({
	components: { BaseIcon, VBtn, VCard, VIcon, VLocaleProvider, VSpacer, VToolbar, VToolbarTitle },

	emits: ["update:modelValue"],

	name: "OverlayWindow",

	props: {
		...overlayListItemNarrowProps,
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

	pointer-events: auto;
}

.overlay-window-toolbar-title {
	/* Reset flex from Vuetify's behavior, where it would grow and compete with spacer */
	flex: auto;
}

.overlay-window-block {
	/* Force LTR so that the content transform doesn't visuall change */
	direction: ltr;
}
</style>
