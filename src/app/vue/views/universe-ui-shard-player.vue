<!--
	Universe UI per shard per player.
	Effectively this is per player, as there is only one shard per player.
-->
<template>
	<StatusNotification
		class="universe-ui-shard-player-status-notification"
		:notifications="player.statusNotifications"
		@shift-player-notifications="shiftPlayerNotifications"
	/>

	<!-- Windows for the player -->
	<OverlayWindow
		v-for="({ listItems, name }, displayItemKey) in displayItems"
		:key="displayItemKey"
		v-model="displayItems[displayItemKey]!.isDisplayed"
		:name="name"
	>
		<template #body>
			<OverlayList :items="listItems">
				<!-- All story -->
				<template #storyAll>
					<StoryNotification :story-notification-entries="storyNotificationEntries" />
				</template>

				<!-- Player stats -->
				<template #stats>
					<template v-for="{ unitUuid, hpMaxValue, hpValue, level, experience, attributes } in stats" :key="unitUuid">
						<StatsBar :color="hpColor" name="HP" :value="hpValue" :max-value="hpMaxValue" />
						<StatsBar :color="mpColor" name="MP" />
						<VTable>
							<tbody>
								<tr>
									<td>Level</td>
									<td>{{ level }}</td>
								</tr>
								<tr>
									<td>Experience</td>
									<td>{{ experience }}</td>
								</tr>
								<tr>
									<td>Attributes</td>
									<td>{{ attributes }}</td>
								</tr>
							</tbody>
						</VTable>
					</template>
				</template>
			</OverlayList>
		</template>
	</OverlayWindow>

	<!-- Game over screen -->
	<OverlayWindow v-model="isGameOver">
		<template #body>
			<UniverseUiGameOver />
		</template>
	</OverlayWindow>
</template>
<script lang="ts">
import Color from "color";
import { PropType, Ref, computed, defineComponent, ref } from "vue";
import { VTable } from "vuetify/components";
import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";
import { Uuid } from "../../common/uuid";
import { CoreDictionary } from "../../core/connection";
import { OverlayList, StatusNotification } from "../components";
import OverlayWindow from "../components/overlay-window.vue";
import StoryNotification from "../components/story-notification.vue";
import { UsedLocale, useLocale } from "../core/locale";
import {
	OverlayBusSource,
	OverlayListItemEntryType,
	OverlayListItems,
	overlayBusEmits,
	useOverlayBusSource
} from "../core/overlay";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { StoryNotificationEntry } from "../core/story-notification";
import { UniverseUiPlayerModel } from "../core/universe-ui";
import StatsBar from "../stats-bar.vue";
import UniverseUiGameOver from "./universe-ui-game-over.vue";

/**
 * Player stats.
 */
// TODO: Attributes need to be typed
type Stats = Partial<Record<"hpValue" | "hpMaxValue" | "level" | "experience", number>> &
	Record<"unitUuid", Uuid> &
	Partial<Record<"attributes", any>>;

export default defineComponent({
	components: {
		OverlayList,
		OverlayWindow,
		StatsBar,
		StatusNotification,
		StoryNotification,
		VTable,
		UniverseUiGameOver
	},

	/**
	 * Created callback.
	 *
	 * @remarks
	 * Initial model update is not necessary, as parent created model with correct data, but if that changes, model update must be added.
	 */
	created() {
		this.universeStore.onUpdatePlayerDictionary({
			/**
			 * Stats update callback.
			 */
			callback: () => {
				this.model = { dictionary: this.player.dictionary };
				this.emitModel();

				// Update stats
				let { units }: CoreDictionary = this.player.dictionary;
				if (Array.isArray(units)) {
					this.stats = (units satisfies Array<string | number> as Array<string | number>)
						.filter<string>((unitUuid): unitUuid is string => typeof unitUuid === "string" && unitUuid.length > 0)
						.map(unitUuid => {
							let { maxHealth, level, experience, stats }: CoreDictionary = this.universeStore.universe.getEntity({
								entityUuid: unitUuid
							}).dictionary;
							return {
								attributes: stats,
								experience: typeof experience === "number" ? experience : undefined,
								hpMaxValue: typeof maxHealth === "number" ? maxHealth : undefined,
								hpValue: this.universeStore.universe.getEntity({ entityUuid: unitUuid }).tempHealth,
								level: typeof level === "number" ? level : undefined,
								unitUuid
							};
						});
				}
			}
		});
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return {
			hpColor: new Color("#1F8C2F"),
			model: this.modelValue,
			mpColor: new Color("#051DE8"),
			stats: new Array<Stats>(),
			storyNotificationMenuDisplaySymbol: Symbol("story-notification-menu-display")
		};
	},

	emits: ["update:modelValue", ...statusNotificationEmits, ...overlayBusEmits],

	methods: {
		/**
		 * Update player entries data.
		 */
		emitModel(): void {
			this.$emit("update:modelValue", this.model satisfies UniverseUiPlayerModel);
		}
	},

	props: {
		modelValue: {
			required: true,
			type: Object as PropType<UniverseUiPlayerModel>
		},

		player: {
			required: true,
			type: Object as PropType<ClientPlayer>
		},

		shard: {
			required: true,
			type: Object as PropType<ClientShard>
		}
	},

	/**
	 * Setup.
	 *
	 * @param props - Props
	 * @param ctx - Context
	 * @returns Composable methods
	 */
	// Force vue inference
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		const stores: Stores = useStores();
		const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();

		// Infer composable
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();

		const { t }: UsedLocale = useLocale();

		// Game status
		const isGameOver: Ref<boolean> = ref(props.player.isGameOver);
		universeStore.onUpdateGameStatus({
			/**
			 * Callback, when player is updated.
			 */
			callback() {
				isGameOver.value = props.player.isGameOver;
			}
		});

		const clickPlayerRecordIndex: symbol = Symbol(`menu-item-player-${props.player.playerUuid}`);
		const clickStoryRecordIndex: symbol = Symbol(`menu-item-player-${props.player.playerUuid}`);

		const playerNameSubtext: Ref<string> = computed(() => {
			const { userAliasDisplayName }: CoreDictionary = props.player.dictionary;
			if (typeof userAliasDisplayName === "string" && userAliasDisplayName.length > 0) {
				return userAliasDisplayName;
			}
			return props.player.playerName;
		});

		const { displayItems }: OverlayBusSource = useOverlayBusSource({
			emit,
			menuItemsRegistryIndex: Symbol(`player-${props.player.playerUuid}`),
			overlayItems: [
				// Player
				{
					listItems: computed(() => {
						return [
							{ data: props.player.playerName, name: "Name" },
							{ id: "stats", name: "Stats", type: OverlayListItemEntryType.Slot }
						] satisfies OverlayListItems;
					}),
					menuItem: computed(() => {
						return {
							clickRecordIndex: clickPlayerRecordIndex,
							icon: "fa-person",
							name: t("menuTitle.player"),
							nameSubtext: playerNameSubtext.value
						};
					})
				},

				// Story
				{
					listItems: computed(() => {
						return [
							{
								tabs: [
									{ items: [{ id: "storyAll", type: OverlayListItemEntryType.Slot }], name: "All" },
									{ items: [], name: "New" }
								],
								type: OverlayListItemEntryType.Tab
							}
						] satisfies OverlayListItems;
					}),
					menuItem: computed(() => {
						return {
							clickRecordIndex: clickStoryRecordIndex,
							icon: "fa-book-open",
							name: "Story",
							nameSubtext: playerNameSubtext.value
						};
					})
				}
			],
			recordStore
		});

		// Infer composable
		// eslint-disable-next-line @typescript-eslint/typedef
		const { shiftPlayerNotifications } = useStatusNotification({ emit });

		const storyNotificationEntries: Ref<Array<StoryNotificationEntry>> = ref(new Array<StoryNotificationEntry>());

		universeStore.onUpdateStoryNotification({
			/**
			 * Callback, when story notifications are updated.
			 */
			callback() {
				let { storyNotifications }: ClientPlayer = props.player;
				while (storyNotifications.length > 0) {
					// Array is not empty
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					let storyNotification: StoryNotificationEntry = storyNotifications.shift()!;

					storyNotificationEntries.value.push({ ...storyNotification });
				}
			}
		});
		return { displayItems, shiftPlayerNotifications, storyNotificationEntries, universeStore, isGameOver };
	}
});
</script>

<style scoped lang="css">
.universe-ui-shard-player-status-notification {
	position: absolute;
	right: 0;
	bottom: 0;
	max-width: 20%;
	max-height: 20%;
	min-width: 10%;
	min-height: 10%;
	margin: 2em;
}
</style>
