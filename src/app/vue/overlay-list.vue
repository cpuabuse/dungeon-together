<!-- 
	Content that goes into overlays, and it's sub-components.
	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->
<template>
	<OverlayListBody :content-type="contentType">
		<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
			<OverlayListItem v-bind="$props">
				<!-- Rather blank than underscore -->
				<!-- eslint-disable-next-line vue/valid-v-for -->
				<template v-for="(slot, name) in $slots">
					<slot :name="name" />
				</template>
			</OverlayListItem>
		</VList>
	</OverlayListBody>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VList } from "vuetify/components";
import { OverlayContentItem } from "./types";
import { overlayContentProps } from "./util";
import { OverlayListBody, OverlayListItem } from ".";

export default defineComponent({
	components: {
		OverlayListBody,
		OverlayListItem,
		VList
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
