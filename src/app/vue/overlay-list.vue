<!-- 
	Content that goes into overlays, and it's sub-components.
	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->
<template>
	<OverlayContent v-bind="$props">
		<!-- Rather blank than underscore -->
		<!-- eslint-disable-next-line vue/valid-v-for -->
		<template v-for="(, slot) in $slots">
			<slot :name="slot" />
		</template>
	</OverlayContent>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import OverlayContent from "./overlay-content.vue";
import { OverlayContentItem } from "./types";
import { overlayContentProps } from "./util";

export default defineComponent({
	components: {
		OverlayContent
	},

	name: "OverlayList",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		isCompact: {
			default: false,
			required: false,
			type: Boolean
		},
		items: { required: true, type: Array as PropType<Array<OverlayContentItem>> },
		...overlayContentProps
	}
});
</script>
