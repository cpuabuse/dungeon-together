<!-- Slot element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps" @ui-action="emitUiAction">
		<!-- Content slot -->
		<template #content>
			<OverlayList :items="items" :content-type="contentType" @ui-action="emitUiAction">
				<!-- Pass all slots through -->
				<template v-for="(slot, name) in $slots" #[name]="props">
					<slot :name="name" v-bind="props" />
				</template>
			</OverlayList>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineAsyncComponent, defineComponent } from "vue";
import {
	OverlayListItems,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

/**
 * Async component for overlay list, since it's circular dependency.
 */
// Infer component type
// eslint-disable-next-line @typescript-eslint/typedef
const OverlayList = defineAsyncComponent(async () => import("./overlay-list.vue"));

export default defineComponent({
	components: {
		OverlayList,
		OverlayListItemAssembler
	},

	emits: overlayListSharedEmits,

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		items: {
			required: true,
			type: Array as PropType<OverlayListItems>
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
		// The `useOverlayListShared` is used for events
		return { ...useOverlayListShared({ emit, props }), ...useOverlayListItemShared({ props }) };
	}
});
</script>
