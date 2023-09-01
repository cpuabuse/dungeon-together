<!-- Universe UI Click -->
<template>
	<OverlayClick v-if="rcMenuData" v-model="isOverlayClickDisplayed" :x="500" :y="200">
		<template #body>
			<OverlayList v-bind="overlayListProps" @ui-action="onUiAction" />
		</template>
	</OverlayClick>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientEntity } from "../../client/entity";
import { ClientUniverseStateRcMenuDataWords, ThisVueStore, UniverseState } from "../../client/gui";
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
		 * Overlay click items.
		 *
		 * @returns Overlay click items
		 */
		overlayClickItems(): OverlayListItems {
			if (this.rcMenuData) {
				if (this.rcMenuData.type === ClientUniverseStateRcMenuDataWords.Cell) {
					// False negative
					// eslint-disable-next-line @typescript-eslint/typedef
					return Array.from(this.rcMenuData.cell.entities).map(([, entity]) => {
						return {
							name: "Cell",
							type: OverlayListItemEntryType.InfoElement,
							uiActions: [
								{
									modeUuid: entity.modeUuid,
									targetEntityUuid: entity.entityUuid,
									uiActionWord: OverlayContainerUiActionWords.EntityInfo
								},
								{
									targetEntityUuid: entity.entityUuid,
									uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo
								}
							]
						};
					});
				}
			}

			return [];
		},

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
		return {
			isOverlayClickDisplayed: true,
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
		rcMenuData: {
			default: null,
			required: false,
			type: Object as PropType<UniverseState["rcMenuData"]>
		}
	}
});
</script>

<style scoped lang="css"></style>
