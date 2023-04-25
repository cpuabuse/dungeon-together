<template>
	<div>
		<div v-if="modelValue" class="overlay-dropdown">
			<VCard h-100 width="100%" class="overflow-hidden">
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

<style scoped>
.overlay-dropdown {
	position: absolute;
	top: 100px;
	right: 100px;
	z-index: 100;
	border: 1px solid #ccc;
	box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
	border-radius: 10px;
	max-height: 50%;
}

.overlay-dropdown-list-container {
	margin: 0;
	padding: 0;
	list-style: none;
}

.overlay-dropdown-list {
	display: block;
	padding: 5px 10px;
}
</style>
