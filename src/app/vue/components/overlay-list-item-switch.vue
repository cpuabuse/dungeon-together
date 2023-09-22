<!-- Switch element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps" @ui-action="emitUiAction">
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
							records[id] = value;
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
import { useLocale } from "../core/locale";
import {
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import { useRecords } from "../core/store";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		VSwitch
	},

	computed: {
		/**
		 * Transform origin for compact switch.
		 *
		 * @returns Transform origin string
		 */
		transformOrigin(): string {
			return this.isRtl ? "center left" : "center right";
		}
	},

	emits: overlayListSharedEmits,

	/**
	 * Props.
	 */
	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		id: {
			required: true,
			type: [String, Symbol]
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @param param - Context
	 * @returns Record operations and shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return {
			...useRecords(),
			...useOverlayListShared({ emit, props }),
			...useOverlayListItemShared({ props }),
			...useLocale()
		};
	}
});
</script>

<style scoped lang="css">
/* Compact switch is too large */
.overlay-list-item-switch-compact {
	transform-origin: v-bind(transformOrigin);
	scale: 0.75;
}
</style>
