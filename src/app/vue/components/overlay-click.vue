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
		x: {
			default: 0,
			type: Number
		},
		y: {
			default: 0,
			type: Number
		},

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
	top: calc(v-bind(y) * 1px);
	left: calc(v-bind(x) * 1px);
	z-index: 100;
	max-height: 50%;
}
</style>
