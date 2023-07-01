<!-- Info element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Inline slot; Omit from display if no data given -->
		<template v-if="data" #inline>
			<!-- Density from list is not passed through into chip -->
			<VChip :density="isCompact ? 'compact' : 'default'">
				{{ data }}
			</VChip>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VChip } from "vuetify/components";
import {
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		VChip
	},
	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		// Will be omitted from display
		// eslint-disable-next-line vue/require-default-prop
		data: {
			required: false,
			type: [String, Number]
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @returns Shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return useOverlayListShared({ props });
	}
});
</script>
