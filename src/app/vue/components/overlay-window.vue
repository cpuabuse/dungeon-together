<!-- Dialog modal -->

<template>
	<!-- Need a block display wrapper for draggable; Will also have fixed direction, so that transform doesn't move window, child locale provide will revert it back -->
	<VLocaleProvider :rtl="false" class="overlay-window-block">
		<!-- `v-show` is used to acquire refs and for performance; if `v-if`, then should be in parent component -->
		<div v-show="modelValue" ref="overlayWindow" class="overlay-window">
			<VLocaleProvider :rtl="isRtl">
				<!-- Flex to enable body's overflow -->
				<VCard class="h-100 w-100 overflow-hidden d-flex flex-column">
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

					<div ref="overlayBodyHandle" class="overlay-window-body">
						<slot name="body"></slot>
					</div>
				</VCard>
			</VLocaleProvider>
		</div>
	</VLocaleProvider>
</template>

<script lang="ts">
import PerfectScrollbar from "perfect-scrollbar";
import { Ref, computed, defineComponent, nextTick, onMounted, ref } from "vue";
import { VBtn, VCard, VLocaleProvider, VSpacer, VToolbar, VToolbarTitle } from "vuetify/components";
import { useDraggable } from "../core/draggable";
import { TextDirectionWords, textDirectionSymbol } from "../core/locale";
import { overlayListItemNarrowProps } from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { BaseIcon } from ".";
import "perfect-scrollbar/css/perfect-scrollbar.css";

export default defineComponent({
	components: { BaseIcon, VBtn, VCard, VLocaleProvider, VSpacer, VToolbar, VToolbarTitle },

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
		const overlayBodyHandle = ref<HTMLElement | null>(null);
		const scrollbarHandle = ref<PerfectScrollbar | null>(null);
		/* eslint-enable @typescript-eslint/typedef */

		const stores: Stores = useStores();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();

		const textDirectionRecord: Ref<TextDirectionWords> = recordStore.computedRecord<TextDirectionWords>({
			defaultValue: TextDirectionWords.Auto,
			id: textDirectionSymbol,
			/**
			 * Validator.
			 *
			 * @param value - Value to validate
			 * @returns True, if value is valid
			 */
			validator(value: unknown): value is TextDirectionWords {
				// Casting to enum type, as `includes()` should work with any value
				return Object.values(TextDirectionWords).includes(value as TextDirectionWords);
			}
		});

		const isRtl: Ref<boolean | undefined> = computed(() => {
			switch (textDirectionRecord.value) {
				case TextDirectionWords.Rtl:
					return true;
				case TextDirectionWords.Ltr:
					return false;
				default:
					return undefined;
			}
		});

		const resizeMargin: number = 8;
		const cssMarginResizeMargin: string = `${resizeMargin + 1}px`;

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
			isRtl,
			overlayWindow,
			overlayWindowHandle,
			...useDraggable({
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
			scrollbarHandle
		};
	}
});
</script>

<style lang="css">
/* Note, positition(left, top) has to be 0, so that resize matches mouse movement */
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
