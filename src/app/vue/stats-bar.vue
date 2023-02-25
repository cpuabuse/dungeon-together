<!--Stats component displaying character stats in a progress bar-->

<template>
	<div class="progress-container">
		<span class="text-subtitle-2">{{ name }}</span>
		<div class="progress-outer-border rounded">
			<VProgressLinear :model-value="value" height="35" :color="progressBarColor">
				<strong>{{ value.toString() }}/{{ maxValue.toString() }}</strong>
			</VProgressLinear>
			<div class="progress-overlay"></div>
		</div>
	</div>
</template>

<script lang="ts">
import Color from "color";
import { PropType, defineComponent } from "vue";
import { VProgressLinear } from "vuetify/components";

export default defineComponent({
	components: { VProgressLinear },

	computed: {
		/**
		 * The color of the progress bar.
		 *
		 * @remarks
		 * Fed into CSS.
		 *
		 * @returns The color of the progress bar in CSS
		 */
		progressBarColor(): string {
			return this.color ? this.color.hex() : "info";
		},

		/**
		 * The width of the progress bar.
		 *
		 * @remarks
		 * Fed into CSS.
		 *
		 * @returns The width of the progress bar in CSS
		 */
		progressContainerWidth(): string {
			return this.width ? `${this.width.toString()}px` : "auto";
		}
	},

	/**
	 * Data for component.
	 *
	 * @returns - Data object
	 */
	data() {
		return {};
	},

	props: {
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		color: { required: false, type: Object as PropType<Color> },

		/**
		 * The max value of the progress bar.
		 */
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		maxValue: { default: 100, type: Number },

		/**
		 * The name of the progress bar.
		 */
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		name: { required: true, type: String },

		/**
		 * The value of the progress bar.
		 */
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		value: { default: 0, type: Number },

		/**
		 * The width of the progress bar.
		 */
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		width: { required: false, type: Number }
	}
});
</script>

<style scoped>
.progress-container {
	width: v-bind("progressContainerWidth");
	margin: 20px;
}
.progress-outer-border {
	border: 5px solid #30302a;
}
.progress-overlay {
	border: 5px solid rgba(0, 0, 0, 0.1);
	height: 35px;
	width: 100%;
	position: relative;
	top: -35px;
	margin-bottom: -35px;
}
</style>
