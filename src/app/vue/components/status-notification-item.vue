<!-- Status notification item -->

<template>
	<VSnackbar :timeout="-1" :model-value="true">{{ text }}</VSnackbar>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VSnackbar } from "vuetify/components";

export default defineComponent({
	components: { VSnackbar },

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return {
			timeout: 5000,
			timeoutId: null as ReturnType<typeof setTimeout> | null
		};
	},

	emits: ["timeout"],

	/**
	 * Mounted callback.
	 */
	mounted() {
		// TODO: Add clear timeout on unmounted
		this.timeoutId = setTimeout(() => {
			this.$emit("timeout");
		}, this.timeout);
	},

	/**
	 * Props.
	 */
	props: {
		text: {
			required: true,
			type: String
		}
	},

	/**
	 * On unmounted.
	 */
	unmounted() {
		// Clear timeout for emits
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
		}
	}
});
</script>
