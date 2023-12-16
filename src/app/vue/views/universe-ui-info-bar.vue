<!--
	Universe UI bar.
	Has two sections, separated by spacer.
	First section contains informational elements, separated by a divider, second contains interactive elements.
	Buttons and icons are downsized not take too much space.
	Buttons have "fill-height" to adjust where pop-up shows.
-->
<template>
	<VSystemBar class="universe-ui-info-bar">
		<VTooltip text="Timer" location="bottom">
			<template #activator="{ props }">
				<div v-bind="props" class="fill-height d-flex align-center">
					<!-- Informational elements -->
					<BaseIcon icon="fa-clock" class="me-1" :color="clockColor" :size="ElementSize.Small" />
					<span class="universe-ui-info-bar-clock-text">{{ clockTime }}</span>
				</div>
			</template>
		</VTooltip>
		<VDivider class="mx-1" inset vertical />

		<VTooltip text="Current level" location="bottom">
			<template #activator="{ props }">
				<div v-bind="props" class="fill-height d-flex align-center">
					<BaseIcon icon="fa-arrow-down-up-across-line" :size="ElementSize.Small" />
					<span v-for="(level, levelKey) in gridLevels" :key="levelKey" class="ms-1 universe-ui-info-bar-level-text">{{
						level
					}}</span>
				</div>
			</template>
		</VTooltip>

		<VSpacer />

		<!-- Interactive elements -->
		<VMenu v-model="musicModelEntry.menu" class="ms-1" location="bottom">
			<template #activator="{ props: menu }">
				<VTooltip v-model="musicModelEntry.tooltip" text="Music" location="bottom">
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

		<VMenu v-model="notificationModelEntry.menu" class="ms-1" location="bottom">
			<template #activator="{ props: menu }">
				<VTooltip v-model="notificationModelEntry.tooltip" text="Notifications" location="bottom">
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
	</VSystemBar>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, mergeProps, shallowRef, watch } from "vue";
import { VBtn, VDivider, VMenu, VSpacer, VSystemBar, VTooltip } from "vuetify/components";
import { ElementSize } from "../common/element";
import { BaseIcon } from "../components";
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
		const stores: Stores = useStores();
		const { onUpdateGridLevel, universe }: Store<StoreWord.Universe> = stores.useUniverseStore();
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
		onUpdateGridLevel({
			/**
			 * Callback when grid level is updated.
			 */
			callback() {
				updateGridLevels();
			},

			// Not needed right now as initial value is watched
			isImmediate: false
		});

		return {
			gridLevels,
			universe
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

.universe-ui-info-bar-clock-text,
.universe-ui-info-bar-level-text {
	/* Text changes, must preserve sizing */
	font-family: monospace, monospace;
}
</style>
