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
			<!-- Density from list is not passed through into switch -->
			<VSwitch
				:density="isCompact ? 'compact' : 'default'"
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
/* Override with CSS is performed because `VSwitch` does not work well with `VList` */
.v-switch {
	margin: -1em 0;
}
</style>
