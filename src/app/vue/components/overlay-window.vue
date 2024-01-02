<!-- Dialog modal -->

<template>
	<!-- `v-show` is used to acquire refs and for performance; if `v-if`, then should be in parent component -->
	<div v-show="modelValue" ref="overlayWindow" class="overlay-window" @mousedown="upOverlay">
		<!-- Flex to enable body's overflow; Border for clarity when cards overlap -->
		<VCard class="h-100 w-100 overflow-hidden d-flex flex-column" :border="true">
			<div ref="overlayWindowHandle">
				<!-- Compact density always, to preserve intended ratio -->
				<VToolbar density="compact">
					<BaseIcon v-if="icon || modeUuid" :icon="icon" :mode-uuid="modeUuid" class="ms-4" />
					<VToolbarTitle v-if="name" class="font-weight-bold overlay-window-toolbar-title">{{ name }}</VToolbarTitle>
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

			<div ref="overlayBodyHandle" class="overlay-window-body">
				<slot name="body"></slot>
			</div>
		</VCard>
	</div>
</template>

<script lang="ts">
import PerfectScrollbar from "perfect-scrollbar";
import { Ref, computed, defineComponent, nextTick, onMounted, ref, watch } from "vue";
import { VBtn, VCard, VSpacer, VToolbar, VToolbarTitle } from "vuetify/components";
import { useDraggable } from "../core/draggable";
import { TextDirectionWords, textDirectionSymbol } from "../core/locale";
import { overlayListItemNarrowProps } from "../core/overlay";
import { GuiStoreOverlayRecord, Store, StoreWord, Stores, useStores } from "../core/store";
import { BaseIcon } from ".";
import "perfect-scrollbar/css/perfect-scrollbar.css";

export default defineComponent({
	components: { BaseIcon, VBtn, VCard, VSpacer, VToolbar, VToolbarTitle },

	emits: ["update:modelValue"],

	name: "OverlayWindow",

	props: {
		...overlayListItemNarrowProps,
		modelValue: { required: true, type: Boolean }
	},

	/**
	 * Setup for refs.
	 *
	 * @param props - Component props
	 * @returns Refs
	 */
	// Infer prop type
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		// Infer refs
		/* eslint-disable @typescript-eslint/typedef */
		const overlayWindow = ref<HTMLDivElement | null>(null);
		const overlayWindowHandle = ref<HTMLDivElement | null>(null);
		const overlayBodyHandle = ref<HTMLElement | null>(null);
		const scrollbarHandle = ref<PerfectScrollbar | null>(null);
		/* eslint-enable @typescript-eslint/typedef */

		// Stores
		const stores: Stores = useStores();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();
		const guiStore: Store<StoreWord.Gui> = stores.useGuiStore();

		// Margin constants
		const resizeMargin: number = 8;
		const cssMarginResizeMargin: string = `${resizeMargin + 1}px`;

		// Deal with "z-index"
		const { handle, zIndex }: GuiStoreOverlayRecord = guiStore.registerOverlay();
		watch(
			() => props.modelValue,
			value => {
				if (value) {
					guiStore.upOverlay({ handle });
				}
			}
		);

		// Mounted
		onMounted(() =>
			// One-liner return
			// eslint-disable-next-line vue/valid-next-tick
			nextTick(() => {
				// Init the bar, delayed since bug https://github.com/mdbootstrap/perfect-scrollbar/issues/106
				if (overlayBodyHandle.value) {
					scrollbarHandle.value = new PerfectScrollbar(overlayBodyHandle.value);
				}
			})
		);

		return {
			overlayWindow,
			overlayWindowHandle,
			...useDraggable({
				// Rewrap ancestor, to be reactive
				ancestorElement: recordStore.computedRecord<HTMLElement | null>({
					defaultValue: null,
					id: guiStore.universeUiElementRecordId,
					/**
					 * Validator for HTML element.
					 *
					 * @param value - Value validator receives
					 * @returns If instance or not of HTML element
					 */
					validator(value: unknown): value is HTMLElement {
						return value instanceof HTMLElement;
					}
				}),
				element: overlayWindow,

				handle: overlayWindowHandle,

				/**
				 * Resize callback.
				 */
				resizeCallback() {
					// Update to make bar visible on resize
					scrollbarHandle.value?.update();
				},
				resizeMargin
			}),
			cssMarginResizeMargin,
			overlayBodyHandle,
			scrollbarHandle,
			/**
			 * Ups the overlay.
			 */
			upOverlay(): void {
				guiStore.upOverlay({ handle });
			},
			zIndex
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
	z-index: v-bind(zIndex);

	pointer-events: auto;
}

.overlay-window-toolbar-title {
	/* Reset flex from Vuetify's behavior, where it would grow and compete with spacer */
	flex: auto;
}

.overlay-window-block {
	display: block;
}

.overlay-window-body {
	/* Required for scrollbar */
	position: relative;
}

.overlay-window-body .ps__rail-y {
	/* Override pseudo classes */
	background: transparent !important;
	/* Note margins are bigger than resize hitbox; Now if resize directly under the scrollbar, it might flicker, but for each increase in margin, the mouse could move faster, and it is too much to tinker with resize polling and execution order */
	margin: v-bind(cssMarginResizeMargin);
}
</style>
