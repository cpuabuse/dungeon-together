<template>
	<OverlayListItemAssembler v-bind="assemblerProps" @ui-action="emitUiAction">
		<template #content>
			<OverlayListBody :content-type="contentType">
				<!-- Uuid element -->
				<highlightjs language="plaintext" :code="uuid" />
			</OverlayListBody>
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
import OverlayListBody from "./overlay-list-body.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		OverlayListBody
	},

	emits: overlayListSharedEmits,

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		uuid: {
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
