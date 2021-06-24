<template>
	<div class="universe">Hello: {{ what }}</div>
	<tsxtest />
	<statealertbox />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../client/gui";
import stateAlertBoxComponent from "./state-alert-box.vue";
import tsxTestComponent from "./tsx/test.vue";

/**
 * Root component.
 */
export default defineComponent({
	components: { statealertbox: stateAlertBoxComponent, tsxtest: tsxTestComponent },

	/**
	 * Update timer every second.
	 */
	created() {
		setInterval(() => {
			this.$data.what = (this as unknown as ThisVueStore).$store.state.universe.application.state.upTime;
		}, 1000);
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			what: 0
		};
	}
});
</script>

<style lang="css">
.universe {
	color: red;
}
</style>
