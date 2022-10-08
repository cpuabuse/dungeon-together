<template>
	<statealert v-for="(alert, index) in alerts" :key="index" :message="alert.message" :level="alert.level" />
	<VAlert border type="success">Alert</VAlert>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VAlert } from "vuetify/components";
import { AlertLevel } from "../client/gui/severity";
import stateAlertComponent from "./state-alert.vue";

export default defineComponent({
	components: { VAlert, statealert: stateAlertComponent },

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
			alerts: Array<{
				/**
				 * Message to be passed.
				 */
				message: string;

				/**
				 * Warninglevel to be passed.
				 */
				level: AlertLevel;
			}>;
		} = {
			alerts: [
				{ level: AlertLevel.Information, message: "Information text" },
				{ level: AlertLevel.Warning, message: "Warning text" },
				{ level: AlertLevel.Failure, message: "Failure text" }
			]
		};

		return result;
	}
});
</script>

<style scoped></style>
