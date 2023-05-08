<!-- Slot element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Content slot -->
		<template #content>
			<OverlayList :items="items" :content-type="contentType">
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
	OverlayListItemEntry,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedProps
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

/**
 * Async component for overlay list, since it's circular dependency.
 */
// Infer component type
// eslint-disable-next-line @typescript-eslint/typedef
const OverlayList = defineAsyncComponent(async () => (await import(".")).OverlayList);

export default defineComponent({
	components: {
		OverlayList,
		OverlayListItemAssembler
	},
	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		items: {
			required: true,
			type: Array as PropType<Array<OverlayListItemEntry>>
		}
	}
});
</script>
