<!--Stats component displaying character stats in a progress bar-->

<template>
	<div class="progress-container">
		<span class="text-subtitle-2">HP</span>
		<div class="progress-outer-border rounded">
			<VProgressLinear v-model="value" height="35" :color="color">
				<strong>{{ value }}/100</strong>
			</VProgressLinear>
			<div class="progress-overlay"></div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VProgressLinear } from "vuetify/components";

export default defineComponent({
	components: { VProgressLinear },

	computed: {
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
		return {
			value: 30
		};
	},

	props: {
		color: { default: "info", type: String },

		/**
		 * The width of the progress bar.
		 */
		// Prop is not used directly, computed will handle `undefined`
		// eslint-disable-next-line vue/require-default-prop
		width: {
			/**
			 * Default value.
			 */
			required: false,

			/**
			 * Type of value.
			 */
			type: Number
		}
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
