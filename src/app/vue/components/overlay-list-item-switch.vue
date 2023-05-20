<!-- Switch element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Inline slot -->
		<template #inline>
			<VSwitch
				hide-details
				:model-value="records[id]"
				@update:model-value="
					value => {
						if (typeof value == 'boolean') {
							setRecord({ id: id, value });
						}
					}
				"
			/>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VSwitch } from "vuetify/components";
import { overlayListChildSharedProps, overlayListItemNarrowProps, overlayListSharedProps } from "../core/overlay";
import { useRecords } from "../core/store";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		VSwitch
	},

	/**
	 * Props.
	 */
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
	 * @returns Record operations
	 */
	setup() {
		return useRecords();
	}
});
</script>
