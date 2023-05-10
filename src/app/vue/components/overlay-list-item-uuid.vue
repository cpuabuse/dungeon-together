<template>
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<template #content>
			<!-- Uuid element -->
			<highlightjs language="plaintext" :code="uuid" />
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { overlayListChildSharedProps, overlayListItemNarrowProps, overlayListSharedProps } from "../core/overlay";
import { OverlayListItemAssembler } from ".";

export default defineComponent({
	components: {
		OverlayListItemAssembler
	},

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		uuid: {
			required: true,
			type: String
		}
	}
});
</script>
