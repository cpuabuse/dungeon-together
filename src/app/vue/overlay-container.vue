<!-- Dialog modal -->

<template>
	<div style="position: absolute; top: 200px; right: 200px; touch-action: none">
		<!-- Width must be set in dialog, since it defines dialog area -->
		<div v-if="modelValue">
			<VCard height="100%" width="100%" class="overflow-hidden">
				<VToolbar height="40">
					<VIcon :icon="icon" class="ml-4" />
					<VToolbarTitle class="text-h5 font-weight-bold">Title</VToolbarTitle>
					<VBtn icon height="inherit" @click="$emit('update:modelValue', false)">
						<VIcon icon="fa-close" />
					</VBtn>
				</VToolbar>
				<slot name="body"></slot>
			</VCard>
		</div>
	</div>
</template>

<script lang="ts">
import { Interactable } from "@interactjs/core/Interactable";
import interact from "interactjs";
import { defineComponent } from "vue";
import { VBtn, VCard, VDialog, VIcon, VToolbar, VToolbarTitle } from "vuetify/components";

/**
 * @param event - Event recieved
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
		 * HTML element
		 */
		target: HTMLElement;
	} = event;

	// Keep the dragged position in the data-x/data-y attributes
	let x: number = (parseFloat(target.getAttribute("data-x") as string) || 0) + event.dx;
	let y: number = (parseFloat(target.getAttribute("data-y") as string) || 0) + event.dy;

	// Translate the element
	target.style.transform = `translate(${x}px, ${y}px)`;

	// Update the posiion attributes
	target.setAttribute("data-x", x.toString());
	target.setAttribute("data-y", y.toString());
}

export default defineComponent({
	components: { VBtn, VCard, VDialog, VIcon, VToolbar, VToolbarTitle },

	/**
	 * Data for component.
	 *
	 * @returns Component data
	 */
	data() {
		return {
			interacteale: null as Interactable | null
		};
	},

	emits: ["update:modelValue"],

	methods: {
		/**
		 * Set interact.
		 */
		setInteract(): void {
			this.interacteale = interact(this.$el).draggable({
				listeners: {
					// call this function on every dragmove event
					move: dragMoveListener
				},

				// keep the element within the area of it's parent
				modifiers: [
					interact.modifiers.restrictRect({
						endOnly: true
					})
				]
			});
		}
	},

	props: {
		icon: {
			default: "fa-carrot",
			type: String
		},
		modelValue: { required: true, type: Boolean }
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
				} else if (this.interacteale) {
					interact(this.$el).unset();
				}
			},
			immediate: true
		}
	}
});
</script>
