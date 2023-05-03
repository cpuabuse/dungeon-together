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
import { overlayListProps, useOverlayListShared } from "./core/overlay";
import { OverlayContentItem } from "./types";
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
		items: { required: true, type: Array as PropType<Array<OverlayContentItem>> },
		...overlayListProps
	},

	/**
	 * Setup function.
	 *
	 * @param props - Reactive props
	 * @returns Props and other
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return useOverlayListShared({ props });
	}
});
</script>
