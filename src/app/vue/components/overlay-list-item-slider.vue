<!-- Slider element -->

<template>
	<VSlider v-model="value" min="0" max="100" :step="1">
		<template v-slot:prepend>
			<VBtn size="small" variant="text" icon="fa-minus" @click="decrement"></VBtn>
		</template>

		<template v-slot:append>
			<VBtn size="small" variant="text" icon="fa-plus" @click="increment"></VBtn>
		</template>
	</VSlider>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VSlider, VBtn } from "vuetify/components";

export default defineComponent({
	components: {
		VSlider,
		VBtn
	},
	data: () => ({
		value: 0
	}),
	methods: {
		decrement() {
			this.value--;
		},
		increment() {
			this.value++;
		}
	}
});
</script>
