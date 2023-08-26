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
import { ClientEntity } from "../../client/entity";
import { ThisVueStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { LogLevel } from "../../core/error";
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
					{
						targetEntityUuid: "1",
						uiActionWord: OverlayContainerUiActionWords.EntityInfo,
						modeUuid: "mode/user/treasure/default"
					},
					{ targetEntityUuid: "1", uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo }
				]
			},
			{
				name: "Cell",
				type: OverlayListItemEntryType.InfoElement,
				uiActions: [
					{
						targetEntityUuid: "1",
						uiActionWord: OverlayContainerUiActionWords.EntityInfo,
						modeUuid: "mode/user/player/default"
					},
					{ targetEntityUuid: "1", uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo }
				]
			}
		];
		return {
			isOverlayClickDisplayed: true,
			overlayClickItems,
			universe: (this as unknown as ThisVueStore).$store.state.universe
		};
	},

	methods: {
		/**
		 * Execute UI action received.
		 *
		 * @param uiAction - UI action
		 */
		onUiAction(uiAction: OverlayContentUiActionParam): void {
			switch (uiAction.uiActionWord) {
				case OverlayContainerUiActionWords.EntityInfo:
					// TODO: Add window with entity info
					break;

				case OverlayContainerUiActionWords.EntityDebugInfo: {
					const targetEntity: ClientEntity = this.universe.getEntity({ entityUuid: uiAction.targetEntityUuid });
					this.universe.log({
						data: targetEntity,
						level: LogLevel.Informational,
						message: `Debug info for entity(entityUuid="${uiAction.targetEntityUuid}")`
					});
					break;
				}

				default:
					this.universe.log({
						error: new Error(`Unknown UI action word: ${uiAction.uiActionWord}`),
						level: LogLevel.Warning
					});
			}
		}
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
