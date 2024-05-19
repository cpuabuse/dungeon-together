<!--
	Universe UI bar.
	Has two sections, separated by spacer.
	First section contains informational elements, separated by a divider, second contains interactive elements.
	Buttons and icons are downsized not take too much space.
	Buttons have "fill-height" to adjust where pop-up shows.
-->
<template>
	<VSystemBar class="universe-ui-info-bar" :min-width="mdAndUp ? 300 : '20vh'">
		<!-- Informational elements -->
		<section class="d-flex fill-height">
			<VTooltip :text="t('infoBar.uptime')" location="bottom">
				<template #activator="{ props }">
					<div v-bind="props" class="d-flex align-center mr-2">
						<BaseIcon icon="fa-clock" :color="clockColor" :size="ElementSize.Small" />
						<span class="universe-ui-info-bar-text ms-1">{{ clockTime }}</span>
					</div>
				</template>
			</VTooltip>

			<!-- FPS translation is omitted intentionally -->
			<VTooltip text="FPS" location="bottom">
				<template #activator="{ props }">
					<div v-bind="props" class="d-flex align-center mr-2">
						<BaseIcon icon="fa-solid fa-wave-square" :color="fpsColor" :size="ElementSize.Small" />
						<span class="universe-ui-info-bar-text ms-1">{{ fps }}</span>
					</div>
				</template>
			</VTooltip>

			<VTooltip :text="t('infoBar.level')" location="bottom">
				<template #activator="{ props }">
					<div v-bind="props" class="d-flex align-center mr-2">
						<BaseIcon icon="fa-arrow-down-up-across-line" :size="ElementSize.Small" />
						<span v-for="(level, levelKey) in gridLevels" :key="levelKey" class="ms-1 universe-ui-info-bar-text">{{
							level
						}}</span>
					</div>
				</template>
			</VTooltip>
			<VDivider class="mx-1" inset vertical />
		</section>

		<VSpacer />

		<section class="universe-ui-info-bar-section">
			<div v-for="player in players" :key="player.playerUuid" class="d-flex align-center">
				<div v-for="resource in player.resources" :key="resource.icon" class="d-flex align-center mr-2">
					<VTooltip :text="resource.name" location="bottom">
						<template #activator="{ props }">
							<BaseIcon :icon="resource.icon" :size="ElementSize.Small" v-bind="props" />
							<span class="universe-ui-info-bar-text ms-1">{{ resource.value }}</span>
						</template>
					</VTooltip>
				</div>
			</div>
		</section>

		<VSpacer />

		<!-- Interactive elements -->
		<section class="d-flex fill-height">
			<VMenu v-model="musicModelEntry.menu" location="bottom">
				<template #activator="{ props: menu }">
					<VTooltip v-model="musicModelEntry.tooltip" :text="t('infoBar.music')" location="bottom">
						<template #activator="{ props: tooltip }">
							<VBtn
								v-bind="mergeProps(menu, tooltip)"
								variant="text"
								class="fill-height"
								size="x-small"
								@click="() => onMenuClick(musicModelEntry)"
							>
								<BaseIcon icon="fa-music" :size="ElementSize.Small" />
							</VBtn>
						</template>
					</VTooltip>
				</template>
				<UniverseUiInfoBarMusicControl />
			</VMenu>

			<VMenu v-model="notificationModelEntry.menu" location="bottom">
				<template #activator="{ props: menu }">
					<VTooltip v-model="notificationModelEntry.tooltip" :text="t('infoBar.notifications')" location="bottom">
						<template #activator="{ props: tooltip }">
							<VBtn
								v-bind="mergeProps(menu, tooltip)"
								variant="text"
								class="fill-height"
								size="x-small"
								@click="() => onMenuClick(notificationModelEntry)"
							>
								<BaseIcon icon="fa-bell" :size="ElementSize.Small" />
							</VBtn>
						</template>
					</VTooltip>
				</template>
				<stateAlertBox />
			</VMenu>
		</section>
	</VSystemBar>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, mergeProps, shallowRef, watch } from "vue";
import { useDisplay } from "vuetify";
import { VBtn, VDivider, VMenu, VSpacer, VSystemBar, VTooltip } from "vuetify/components";
import { ElementSize } from "../common/element";
import { BaseIcon } from "../components";
import { UsedDevice, useDevice } from "../core/device";
import { UsedGraphics, useGraphics } from "../core/graphics";
import { UsedLocale, useLocale } from "../core/locale";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { UniverseUiShardEntries } from "../core/universe-ui";
import stateAlertBoxComponent from "../state-alert-box.vue";
import UniverseUiInfoBarMusicControl from "./universe-ui-info-bar-music-control.vue";

/**
 * Type for storage of models for menu and tooltip.
 */
type ElementModelEntry = {
	/**
	 * Menu model.
	 */
	menu: boolean;

	/**
	 * Tooltip model.
	 */
	tooltip: boolean;
};

/**
 * Multiplier for green FPS threshold.
 */
const greenFpsThresholdMultiplier: number = 0.9;

/**
 * Multiplier for orange FPS threshold.
 */
const orangeFpsThresholdMultiplier: number = 0.5;

/**
 * Milliseconds in one second.
 */
const oneSecondInMs: number = 1000;

/**
 * Milliseconds in one minute.
 */
const oneMinuteInMs: number = 60000;

/**
 * Green threshold in milliseconds.
 */
const greenThreshold: number = 5000;

/**
 * Orange threshold in milliseconds.
 */
const orangeThreshold: number = 60000;

/**
 * Number after which extra digit is not necessary.
 */
const secondDigitThreshold: number = 10;

export default defineComponent({
	components: {
		BaseIcon,
		UniverseUiInfoBarMusicControl,
		VBtn,
		VDivider,
		VMenu,
		VSpacer,
		VSystemBar,
		VTooltip,
		stateAlertBox: stateAlertBoxComponent
	},

	computed: {
		/**
		 * Clock color.
		 *
		 * @returns Color
		 */
		clockColor(): string {
			if (this.upTime < greenThreshold) {
				return "green";
			}
			if (this.upTime < orangeThreshold) {
				return "orange";
			}
			return "red";
		},

		/**
		 * Clock time in format `00:00` (`minutes:seconds`).
		 *
		 * @returns Clock time
		 */
		clockTime(): string {
			const minutes: number = Math.floor(this.upTime / oneMinuteInMs);
			const seconds: number = Math.floor((this.upTime % oneMinuteInMs) / oneSecondInMs);
			return `${minutes < secondDigitThreshold ? "0" : ""}${minutes}:${
				seconds < secondDigitThreshold ? "0" : ""
			}${seconds}`;
		},

		/**
		 * FPS padded to format `00/00` (`average/target`).
		 *
		 * @returns FPS string
		 */
		fps(): string {
			const targetFps: string = this.targetFps.toString();
			const averageFps: string = this.averageFps.toString().padStart(targetFps.length, "0");
			return `${averageFps}/${targetFps}`;
		},

		/**
		 * FPS state colors.
		 *
		 * @returns Green at 90%, orange at 50%, red otherwise
		 */
		fpsColor(): string {
			if (this.averageFps >= this.targetFps * greenFpsThresholdMultiplier) {
				return "green";
			}
			if (this.averageFps >= this.targetFps * orangeFpsThresholdMultiplier) {
				return "orange";
			}
			return "red";
		}
	},

	/**
	 * Update timer every second.
	 */
	created() {
		// If JS event loop lags and time is inaccurately updated, it is not a big deal, as exact seconds do not matter much.
		this.upTimeIntervalHandle = setInterval(() => {
			this.$data.upTime = this.universe.application.state.upTime;
		}, oneSecondInMs);
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			ElementSize,
			musicModelEntry: { menu: false, tooltip: false } satisfies ElementModelEntry,
			notificationModelEntry: { menu: false, tooltip: false } satisfies ElementModelEntry,
			players: [
				{
					playerUuid: "player0",
					resources: [
						{ icon: " fa-solid fa-coins", name: "Gold", value: 0 },
						{ icon: "fa-solid fa-gem", name: "Crystals", value: 0 }
					]
				}
			],
			sectionWidth: 0,
			upTime: 0,
			upTimeIntervalHandle: null as ReturnType<typeof setInterval> | null
		};
	},

	methods: {
		mergeProps,

		/**
		 * This is a function to hide tooltip when menu is opened.
		 *
		 * @param modelEntry - A collection of models for modification; Not destructured to preserve reactivity
		 */
		onMenuClick(modelEntry: ElementModelEntry): void {
			if (modelEntry.menu) {
				modelEntry.tooltip = false;
			}
		}
	},

	props: {
		shardEntries: {
			/**
			 * Shard entries default value.
			 *
			 * @returns Empty array
			 */
			default: () => [],
			required: false,
			type: Map as PropType<UniverseUiShardEntries>
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @param ctx - Context
	 * @returns Composable methods
	 */
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		// Initialize stores
		const stores: Stores = useStores();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();
		const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();

		// Adjustment of display size
		const {
			xs,
			mdAndUp
		}: {
			/**
			 * Extra small display.
			 */
			xs: Ref<boolean> /**
			 */;

			/**
			 * Medium and up display.
			 */
			mdAndUp: Ref<boolean>;
		} = useDisplay();

		// Initialize locale
		const { t }: UsedLocale = useLocale();

		// Initialize graphics
		let usedDevice: UsedDevice = useDevice({ recordStore });
		let { averageFps, targetFps }: UsedGraphics = useGraphics({ recordStore, universeStore, usedDevice });

		// #region Grids
		const gridLevels: Ref<Array<number>> = shallowRef(new Array<number>());

		// Watch shards to be reactive on shard add/remove
		watch(
			() => props.shardEntries,
			() => {
				updateGridLevels();
			}
		);

		/**
		 * Update grid levels.
		 */
		function updateGridLevels(): void {
			gridLevels.value = Array.from(props.shardEntries)
				// ESlint does not infer
				// eslint-disable-next-line @typescript-eslint/typedef
				.map(([, { shard }]) => {
					// ESlint does not infer
					// eslint-disable-next-line @typescript-eslint/typedef
					return Array.from(shard.grids).map(([, grid]) => {
						return grid.currentLevel;
					});
				})
				.flat();
		}

		// TODO: Remove watcher and move this functionality to shard/grid component, enable immediate
		universeStore.onUpdateGridLevel({
			/**
			 * Callback when grid level is updated.
			 */
			callback() {
				updateGridLevels();
			},

			// Not needed right now as initial value is watched
			isImmediate: false
		});
		// #endregion

		return {
			averageFps,
			gridLevels,
			mdAndUp,
			t,
			targetFps,
			universe: universeStore.universe,
			xs
		};
	},

	/**
	 * On unmounted.
	 */
	unmounted() {
		if (this.upTimeIntervalHandle) {
			clearInterval(this.upTimeIntervalHandle);
		}
	}
});
</script>

<style scoped lang="css">
.universe-ui-info-bar {
	/* Added to catch events */
	pointer-events: auto;
}

.universe-ui-info-bar-text {
	/* Text changes, must preserve sizing */
	font-family: monospace, monospace;
}

.universe-ui-info-bar-section {
	position: absolute;
	/* new */
	left: 50%;
	transform: translateX(-50%);
}
</style>
