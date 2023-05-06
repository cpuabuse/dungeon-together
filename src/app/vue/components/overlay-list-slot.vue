<!-- Slot element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="item.icon"
		:name="item.name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<template #content>
			<slot :name="item.id" />
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import {
	OverlayListItemEntryExtract,
	OverlayListItemEntryType,
	overlayListChildSharedProps,
	overlayListSharedProps
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler
	},
	props: {
		item: {
			required: true,
			type: Object as PropType<OverlayListItemEntryExtract<OverlayListItemEntryType.Slot>>
		},
		...overlayListSharedProps,
		...overlayListChildSharedProps
	}
});
</script>
