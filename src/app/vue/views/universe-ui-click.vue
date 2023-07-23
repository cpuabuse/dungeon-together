<!-- Universe UI Click -->
<template>
	<OverlayClick v-model="isOverlayClickDisplayed" :x="500" :y="200">
		<template #body>
			<OverlayList v-bind="overlayListProps" @ui-action="onUiAction" />
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
	OverlayContentUiActionParam,
	OverlayListItemEntryType,
	OverlayListItems,
	OverlayListType
} from "../core/overlay";
import { ThisVueStore } from "../../client/gui";
import { LogLevel } from "../../core/error";

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
				uiActions: [
					{ targetEntityUuid: "1", uiActionWord: OverlayContainerUiActionWords.EntityInfo },
					{ uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo, targetEntityUuid: "1" }
				]
			}
		];
		return {
			isOverlayClickDisplayed: true,
			overlayClickItems,
			universe: (this as unknown as ThisVueStore).$store.state.universe
		};
	},

	props: {
		cellUuid: {
			required: true,
			type: String as PropType<Uuid>
		}
	},

	methods: {
		onUiAction(uiAction: OverlayContentUiActionParam): void {
			switch (uiAction.uiActionWord) {
				case OverlayContainerUiActionWords.EntityInfo:
					console.log(uiAction.targetEntityUuid);
					break;

				case OverlayContainerUiActionWords.EntityDebugInfo: {
					const targetEntity = this.universe.getEntity({ entityUuid: uiAction.targetEntityUuid });
					this.universe.log({
						level: LogLevel.Informational,
						data: targetEntity,
						message: `Debug info for entity(entityUuid="${uiAction.targetEntityUuid}")`
					});
					break;
				}
			}
		}
	}
});
</script>

<style scoped lang="css"></style>
