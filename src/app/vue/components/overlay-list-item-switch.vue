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
			<!-- 
				Various problems are addressed here, as source of problems is switch itself:
				- Vertical height:
						- Negative margin to fix switch vertically expanding list item
				- Clipping:
						- Inset, to fix clipping of switch handle with negative margins of parents
						- For non compact switch handle hover shadow and ripple are scaled down with CSS
				- Density:
						- Density from list is not passed through to switch automatically
						- Density doesn't do anything for inset as of now, so CSS scales it down
			-->
			<VSwitch
				:density="isCompact ? 'compact' : 'default'"
				hide-details
				:model-value="records[id]"
				inset
				:class="{ 'my-n2': true, 'overlay-list-item-switch-compact': isCompact }"
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
import {
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
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
	 * @param props - Props
	 * @returns Record operations and shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return { ...useRecords(), ...useOverlayListShared({ props }) };
	}
});
</script>

<style scoped lang="css">
/* Compact switch is too large */
.overlay-list-item-switch-compact {
	transform-origin: center right;
	scale: 0.75;
}

/* Non compact density should have smaller switch hover shadow not to be clipped, also for ripple */
:not(.overlay-list-item-switch-compact) :deep(.v-selection-control__input:hover::before),
:deep(.v-selection-control__input .v-ripple__container) {
	scale: 0.5;
}
</style>
