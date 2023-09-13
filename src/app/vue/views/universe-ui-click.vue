<!-- Universe UI Click -->
<template>
	<OverlayClick v-if="rcMenuData" v-model="isOverlayClickDisplayed" :x="rcMenuData.x" :y="rcMenuData.y">
		<template #body>
			<OverlayList v-bind="overlayListProps" @ui-action="onUiAction" />
		</template>
	</OverlayClick>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientCell } from "../../client/cell";
import { ClientPlayer } from "../../client/connection";
import { ClientEntity } from "../../client/entity";
import { ClientUniverseStateRcMenuDataWords, ThisVueStore, UniverseState } from "../../client/gui";
import { MessageTypeWord } from "../../common/defaults/connection";
import { CoreEnvelope, processQueueWord } from "../../core/connection";
import { LogLevel } from "../../core/error";
import { ActionWords } from "../../server/action";
import { ExtractPropsFromComponentClass } from "../common/utility-types";
import OverlayClick from "../components/overlay-click.vue";
import OverlayList from "../components/overlay-list.vue";
import {
	OverlayContainerUiActionWords,
	OverlayContentUiActionParam,
	OverlayListItemEntry,
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
					// Get cell
					const { cell }: Record<"cell", ClientCell> = this.rcMenuData;

					// TODO: Add active unit system, where we will know active player, and active unit; Also, potentially need to receive shard information through `rcMenuData` prop - for now we just iterate through all; Right now we are iterating through all
					const playerUnitEntries: Array<[ClientPlayer, string]> = Array.from(this.universe.shards)
						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						.map(([, shard]) => {
							// False negative
							// eslint-disable-next-line @typescript-eslint/typedef
							return Array.from(shard.players).map(([, player]) => {
								return Array.from(shard.units).map(unitUuid => {
									return [player, unitUuid] satisfies [ClientPlayer, string];
								});
							});
						})
						.flat(2);

					// False negative
					// eslint-disable-next-line @typescript-eslint/typedef
					const cellUiActions: Array<OverlayContentUiActionParam> = playerUnitEntries.map(([player, unitUuid]) => {
						return {
							icon: "fa-person-walking-dashed-line-arrow-right",
							player,
							targetCellUuid: cell.cellUuid,
							uiActionWord: OverlayContainerUiActionWords.ForceMovement,
							unitUuid
						} satisfies OverlayContentUiActionParam;
					});

					// eslint-disable-next-line @typescript-eslint/typedef
					const entityItems = Array.from(this.rcMenuData.cell.entities).map(([targetEntityUuid, entity]) => {
						let entityAttackUiActions: Array<OverlayContentUiActionParam> = playerUnitEntries.map(
							// False negative
							// eslint-disable-next-line @typescript-eslint/typedef
							([player, unitUuid]) => {
								return {
									entityActionWord: ActionWords.Attack,
									icon: "fa-khanda",
									player,
									targetEntityUuid,
									uiActionWord: OverlayContainerUiActionWords.EntityAction,
									unitUuid
								} satisfies OverlayContentUiActionParam;
							}
						);

						return {
							modeUuid: entity.modeUuid,
							name: "Entity",
							type: OverlayListItemEntryType.InfoElement,
							uiActions: entityAttackUiActions
						} satisfies OverlayListItemEntry;
					});

					return [
						{
							icon: "fa-layer-group",
							name: "Cell",
							type: OverlayListItemEntryType.InfoElement,
							uiActions: cellUiActions
						},
						...entityItems
					];
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

				case OverlayContainerUiActionWords.ForceMovement: {
					let { connection, playerUuid }: ClientPlayer = uiAction.player;
					if (connection) {
						Promise.all([
							connection.socket.send(
								new CoreEnvelope({
									messages: [
										{
											body: {
												hasDirection: false,
												playerUuid,
												targetCellUuid: uiAction.targetCellUuid,
												unitUuid: uiAction.unitUuid
											},
											type: MessageTypeWord.Movement
										}
									]
								})
							),
							connection.tick({ word: processQueueWord })
						]).catch(error => {
							this.universe.log({
								data: uiAction,
								error: new Error(`Failed to send movement message from UI action.`, { cause: error }),
								level: LogLevel.Error
							});
						});
					}
					break;
				}

				case OverlayContainerUiActionWords.EntityAction: {
					let { connection, playerUuid }: ClientPlayer = uiAction.player;
					if (connection) {
						Promise.all([
							connection.socket.send(
								new CoreEnvelope({
									messages: [
										{
											body: {
												controlUnitUuid: uiAction.unitUuid,
												playerUuid,
												targetEntityUuid: uiAction.targetEntityUuid,
												type: uiAction.entityActionWord
											},
											type: MessageTypeWord.EntityAction
										}
									]
								})
							),
							connection.tick({ word: processQueueWord })
						]).catch(error => {
							this.universe.log({
								data: uiAction,
								error: new Error(`Failed to send action message from UI action.`, { cause: error }),
								level: LogLevel.Error
							});
						});
					}
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
