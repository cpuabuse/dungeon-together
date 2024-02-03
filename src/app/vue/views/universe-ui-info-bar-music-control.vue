<template>
	<!-- "div" is created for development, remove when integrated -->
	<div class="d-flex">
		<VCard class="universe-ui-info-bar-music-control-container">
			<VBtnToggle divided>
				<VBtn icon="fa-backward-step" />
				<VBtn icon="fa-pause" />
				<VBtn icon="fa-forward-step" />
				<!-- TODO: Icon changes based on volume -->
				<VBtn icon="fa-volume-xmark" />
			</VBtnToggle>

			<!-- TODO: Fix slider display -->
			<VSlider />
		</VCard>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VBtn, VBtnToggle, VCard, VSlider } from "vuetify/components";

export default defineComponent({
	components: {
		VBtn,
		VBtnToggle,
		VCard,
		VSlider
	}
});
</script>

<style scoped lang="css">
.universe-ui-info-bar-music-control-container {
}
</style>
