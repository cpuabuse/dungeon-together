<!-- Dialog modal -->

<template>
	<div ref="overlayWindow" style="position: absolute; top: 200px; right: 200px; touch-action: none">
		<!-- Width must be set in dialog, since it defines dialog area -->
		<div v-if="modelValue">
			<VCard class="h-100 w-100 overflow-hidden">
				<VToolbar density="compact">
					<VIcon :icon="icon" class="ms-4" />
					<VToolbarTitle class="font-weight-bold">Title</VToolbarTitle>
					<VBtn size="small" icon="fa-close" @click="$emit('update:modelValue', false)" />
				</VToolbar>

				<slot name="body"></slot>
			</VCard>
		</div>
	</div>
</template>

<script lang="ts">
import type { Interactable } from "@interactjs/types";
import interact from "interactjs";
import { Ref, defineComponent, ref } from "vue";
import { VBtn, VCard, VIcon, VToolbar, VToolbarTitle } from "vuetify/components";

/**
 * @param event - Event received
 */
function dragMoveListener(event: {
	/**
	 * Element.
	 */
	target: HTMLElement;

	/**
	 * X coordinate.
	 */
	dx: number;

	/**
	 * Y coordinate.
	 */
	dy: number;
}): void {
	let {
		target
	}: {
		/**
		 * HTML element.
		 */
		target: HTMLElement;
	} = event;

	// Keep the dragged position in the data-x/data-y attributes
	let x: number = (parseFloat(target.getAttribute("data-x") as string) || 0) + event.dx;
	let y: number = (parseFloat(target.getAttribute("data-y") as string) || 0) + event.dy;

	// Translate the element
	target.style.transform = `translate(${x}px, ${y}px)`;

	// Update the position attributes
	target.setAttribute("data-x", x.toString());
	target.setAttribute("data-y", y.toString());
}

export default defineComponent({
	components: { VBtn, VCard, VIcon, VToolbar, VToolbarTitle },

	/**
	 * Data for component.
	 *
	 * @returns Component data
	 */
	data() {
		return {
			interactable: null as Interactable | null
		};
	},

	emits: ["update:modelValue"],

	/**
	 *
	 */
	methods: {
		/**
		 * Set interact.
		 */
		setInteract(): void {
			if (this.overlayWindow) {
				this.interactable = interact(this.overlayWindow).draggable({
					listeners: {
						// Call this function on every drag move event
						move: dragMoveListener
					},

					// Keep the element within the area of it's parent
					modifiers: [
						interact.modifiers.restrictRect({
							endOnly: true
						})
					]
				});
			}
		}
	},

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
		const overlayWindow: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null);

		return { overlayWindow };
	},

	watch: {
		modelValue: {
			/**
			 * Handler for model value.
			 *
			 * @param value - Show value
			 */
			handler(value: boolean): void {
				if (value) {
					this.setInteract();
				} else if (this.interactable && this.overlayWindow) {
					interact(this.overlayWindow).unset();
				}
			},
			immediate: true
		}
	}
});
</script>
