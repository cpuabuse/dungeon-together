<template>
	<div>
		<div v-if="modelValue" class="overlay-click">
			<VCard class="overflow-hidden h-100 w-100">
				<slot name="body"></slot>
			</VCard>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCard } from "vuetify/components";

export default defineComponent({
	components: {
		VCard
	},

	props: {
		modelValue: { required: true, type: Boolean },
		zIdx: {
			default: 0,
			type: Number
		}
	}
});
</script>

<style scoped lang="css">
.overlay-click {
	position: absolute;
	top: 100px;
	right: 100px;
	z-index: 100;
	max-height: 50%;
}
</style>
