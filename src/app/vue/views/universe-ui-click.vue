<!-- Universe UI Click -->
<template>
	<OverlayClick v-model="isOverlayClickDisplayed" :x="500" :y="200">
		<template #body>
			<OverlayList v-bind="overlayListProps" />
		</template>
	</OverlayClick>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { Uuid } from "../../common/uuid";
import { ExtractPropsFromComponentClass } from "../common/utility-types";
import OverlayClick from "../components/overlay-click.vue";
import OverlayList from "../components/overlay-list.vue";
import {
	OverlayContainerUiActionWords,
	OverlayListItemEntryType,
	OverlayListItems,
	OverlayListType
} from "../core/overlay";

export default defineComponent({
	components: { OverlayClick, OverlayList },

	computed: {
		/**
		 * Props for overlay click.
		 *
		 * @returns Props
		 */
		overlayListProps(): ExtractPropsFromComponentClass<typeof OverlayList> {
			return { contentType: OverlayListType.MenuCompact, items: this.overlayClickItems };
		}
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		const overlayClickItems: OverlayListItems = [
			{
				name: "Cell",
				type: OverlayListItemEntryType.InfoElement,
				uiActions: [{ targetEntityUuid: "1", uiActionWord: OverlayContainerUiActionWords.EntityInfo }]
			}
		];
		return {
			isOverlayClickDisplayed: true,
			overlayClickItems
		};
	},

	props: {
		cellUuid: {
			required: true,
			type: String as PropType<Uuid>
		}
	}
});
</script>

<style scoped lang="css"></style>
