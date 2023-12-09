<!-- Universe UI bar -->
<template>
	<VSystemBar class="universe-ui-info-bar" align="start">
		<VMenu class="ms-1" location="bottom">
			<template #activator="{ props }">
				<div v-bind="props" style="cursor: pointer; height: 100%">
					<!-- Size is small because there is menu between button and bar -->
					<BaseIcon v-ripple icon="fa-bell" />
				</div>
			</template>
			<stateAlertBox />
		</VMenu>
		<VDivider class="ms-1" inset vertical />

		<BaseIcon icon="fa-clock" class="ms-1" :color="clockColor" />
		<VDivider class="ms-1" inset vertical />

		<span>{{ clockTime }}</span>
		<VDivider class="ms-1" inset vertical />

		<BaseIcon icon="fa-arrow-down-up-across-line" class="ms-1" />
		<span v-for="(level, levelKey) in gridLevels" :key="levelKey" class="ms-1">{{ level }}</span>
	</VSystemBar>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, shallowRef, watch } from "vue";
import { VDivider, VMenu, VSystemBar } from "vuetify/components";
import { BaseIcon } from "../components";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { UniverseUiShardEntries } from "../core/universe-ui";
import stateAlertBoxComponent from "../state-alert-box.vue";

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
	components: { BaseIcon, VDivider, VMenu, VSystemBar, stateAlertBox: stateAlertBoxComponent },

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
		return { upTime: 0, upTimeIntervalHandle: null as ReturnType<typeof setInterval> | null };
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
</style>
