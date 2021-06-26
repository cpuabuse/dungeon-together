<template>
	<statealert v-for="(alert, index) in alerts" :key="index" :message="alert" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import stateAlertComponent from "./state-alert.vue";

export default defineComponent({
	components: { statealert: stateAlertComponent },

	/**
	 * Data for component.
	 *
	 * @returns Component
	 */
	data() {
		let result: {
			/**
			 * Information about alerts inside the box.
			 */
			alerts: Array<string>;
		} = {
			alerts: ["a", "b", "c"]
		};

		return result;
	}
});
</script>

<style scoped></style>
