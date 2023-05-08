<template>
	<OverlayListItemAssembler
		:icon="item.icon"
		:name="item.name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<template #content>
			<!-- Uuid element -->
			<highlightjs language="plaintext" :code="item.uuid" />
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
import { OverlayListItemAssembler } from ".";

export default defineComponent({
	components: {
		OverlayListItemAssembler
	},

	props: {
		item: {
			required: true,
			type: Object as PropType<OverlayListItemEntryExtract<OverlayListItemEntryType.Uuid>>
		},
		...overlayListSharedProps,
		...overlayListChildSharedProps
	}
});
</script>
