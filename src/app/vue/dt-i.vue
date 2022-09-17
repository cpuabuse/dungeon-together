<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2"
		v-bind="{ viewBox, 'aria-label': ariaLabel, fill }"
		role="img"
	>
		<path v-bind="{ d }" />
	</svg>
</template>

<script lang="ts">
import Color from "color";
import { PropType, defineComponent } from "vue";
import { SimpleSvg } from "../common/simple-svg";

export default defineComponent({
	computed: {
		/**
		 * Aria label.
		 *
		 * @returns Aria label
		 */
		ariaLabel(): string | undefined {
			// If label is undefined, attribute is not rendered
			return this.label;
		},

		/**
		 * SVG path.
		 *
		 * @returns SVG path
		 */
		d(): string {
			return this.svg.d;
		},

		/**
		 * Fill color.
		 *
		 * @returns Fill color
		 */
		fill(): string | undefined {
			// If label is undefined, attribute is not rendered
			return this.color ? this.color.hex() : undefined;
		},

		/**
		 * View box.
		 *
		 * @returns View box
		 */
		viewBox(): string {
			return this.svg.viewBox;
		}
	},

	props: {
		color: Color,
		// If label is undefined, attribute is not rendered
		// eslint-disable-next-line vue/require-default-prop
		label: String,
		svg: { required: true, type: Object as PropType<SimpleSvg> }
	}
});
</script>
