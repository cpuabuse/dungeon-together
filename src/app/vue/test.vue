<template>
	<div class="test">Hello: {{ what }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ThisVueStore } from "../client/gui";

/**
 * Root component.
 */
export default defineComponent({
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
.test {
	color: red;
}
</style>
