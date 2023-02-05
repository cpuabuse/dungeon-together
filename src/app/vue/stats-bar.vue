<!--Stats component displaying character stats ina progress bar-->

<template>
	<div class="progress-container">
		<span class="text-subtitle-2">HP</span>
		<VProgressLinear v-model="value" class="rounded-lg progress" height="35" color="#051DE8">
			<strong>{{ value }}/100</strong>
		</VProgressLinear>
		<div class="progress-overlay rounded-lg"></div>
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
.progress-overlay {
	border: 5px solid rgba(0, 0, 0, 0.1);
	height: 35px;
	width: 100%;
	position: relative;
	top: -35px;
}
.progress >>> .v-progress-linear__determinate {
	border-radius: 5px;
}
</style>
