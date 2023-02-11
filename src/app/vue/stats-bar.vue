<!--Stats component displaying character stats in a progress bar-->

<template>
	<div class="progress-container">
		<span class="text-subtitle-2">HP</span>
		<div class="progress-outer-border rounded">
			<VProgressLinear v-model="value" height="35" color="#051DE8">
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

	/**
	 * Data for component.
	 *
	 * @returns - Data object
	 */
	data() {
		return {
			value: 30
		};
	}
});
</script>

<style scoped>
.progress-container {
	width: 500px;
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
