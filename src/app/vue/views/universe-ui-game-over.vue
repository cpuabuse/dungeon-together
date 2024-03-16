<template>
	<div class="d-flex flex-column justify-center">
		<div class="text-center pt-2 pb-4">
			<h1>Game Over</h1>
		</div>

		<!-- Retry and quit section -->
		<div class="d-flex justify-center">
			<VBtn class="ma-2" size="large" variant="text" @click="refreshPage"> Retry </VBtn>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VBtn } from "vuetify/components";

export default defineComponent({
	components: { VBtn },

	methods: {
		// TODO: Change to navigate to the main menu or reinitialize
		refreshPage() {
			location.reload();
		}
	}
});
</script>
