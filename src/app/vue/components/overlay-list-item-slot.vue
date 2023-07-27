<!-- Slot element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps" @ui-action="emitUiAction">
		<template #content>
			<slot :name="id" />
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler
	},

	emits: overlayListSharedEmits,

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		id: {
			required: true,
			type: String
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @param param - Context
	 * @returns Shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return { ...useOverlayListShared({ emit, props }), ...useOverlayListItemShared({ props }) };
	}
});
</script>
