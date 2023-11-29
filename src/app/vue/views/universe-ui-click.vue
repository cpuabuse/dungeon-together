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
import { ClientUniverseStateRcMenuData, ClientUniverseStateRcMenuDataWords } from "../../client/gui";
import { MessageTypeWord } from "../../common/defaults/connection";
import { CoreEnvelope, processQueueWord } from "../../core/connection";
import { LogLevel } from "../../core/error";
import { ActionWords } from "../../server/action";
import { ExtractPropsFromComponentClass } from "../common/utility-types";
import { OverlayClick, OverlayList } from "../components";
import {
	OverlayContainerUiActionWords,
	OverlayContentUiActionParam,
	OverlayListItemEntry,
	OverlayListItemEntryType,
	OverlayListItems,
	OverlayListType
} from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";

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

					const cellUiActions: Array<OverlayContentUiActionParam> = playerUnitEntries
						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						.map(([player, unitUuid]) => {
							return [
								{
									icon: "fa-person-walking-dashed-line-arrow-right",
									player,
									targetCellUuid: cell.cellUuid,
									uiActionWord: OverlayContainerUiActionWords.ForceMovement,
									unitUuid
								},
								{
									icon: "fa-question",
									targetCellUuid: cell.cellUuid,
									uiActionWord: OverlayContainerUiActionWords.CellDebugInfo
								}
							] satisfies Array<OverlayContentUiActionParam>;
						})
						.flat();

					const entityItems: OverlayListItems = Array.from(this.rcMenuData.cell.entities).map(
						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						([targetEntityUuid, entity]) => {
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
							let entityUseUiActions: Array<OverlayContentUiActionParam> = playerUnitEntries.map(
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								([player, unitUuid]) => {
									return {
										entityActionWord: ActionWords.Use,
										icon: "fa-hand",
										player,
										targetEntityUuid,
										uiActionWord: OverlayContainerUiActionWords.EntityAction,
										unitUuid
									} satisfies OverlayContentUiActionParam;
								}
							);
							let entityDebugInfoUiActions: Array<OverlayContentUiActionParam> = playerUnitEntries.map(
								// False negative
								// eslint-disable-next-line @typescript-eslint/typedef
								() => {
									return {
										icon: "fa-question",
										targetEntityUuid,
										uiActionWord: OverlayContainerUiActionWords.EntityDebugInfo
									} satisfies OverlayContentUiActionParam;
								}
							);

							return {
								modeUuid: entity.modeUuid,
								name: "Entity",
								type: OverlayListItemEntryType.InfoElement,
								uiActions: [...entityAttackUiActions, ...entityUseUiActions, ...entityDebugInfoUiActions]
							} satisfies OverlayListItemEntry;
						}
					);

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
			previousCell: null as ClientCell | null
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

				case OverlayContainerUiActionWords.CellDebugInfo: {
					const targetCell: ClientCell = this.universe.getCell({ cellUuid: uiAction.targetCellUuid });
					this.universe.log({
						data: targetCell,
						level: LogLevel.Informational,
						message: `Debug info for cell(cellUuid="${uiAction.targetCellUuid}")`
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
						// @ts-expect-error Switch must be exhaustive
						// Never should not be reached
						// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
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
			type: Object as PropType<ClientUniverseStateRcMenuData>
		}
	},

	/**
	 * Setup hook.
	 *
	 * @returns Universe store
	 */
	setup() {
		const stores: Stores = useStores();
		const { universe }: Store<StoreWord.Universe> = stores.useUniverseStore();

		return {
			universe
		};
	},

	watch: {
		rcMenuData: {
			/**
			 * Process menu update.
			 *
			 * @param value - Value
			 */
			handler(value: ClientUniverseStateRcMenuData): void {
				let newCell: ClientCell | null = null;

				// Unset the glow on the previous cell
				if (this.previousCell) {
					this.previousCell.setFilters({ glow: false });
				}

				// Sets the glow on the cell
				if (value) {
					if (value.type === ClientUniverseStateRcMenuDataWords.Cell) {
						value.cell.setFilters({ glow: true });

						// Cache the cell
						newCell = value.cell;
					}
				}

				// Update the previous cell
				this.previousCell = newCell;
			}
		}
	}
});
</script>

<style scoped lang="css"></style>
