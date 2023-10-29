<!-- Universe UI bar -->
<template>
	<VSystemBar>
		<span v-for="(level, levelKey) in gridLevels" :key="levelKey">{{ level }}</span>
	</VSystemBar>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, shallowRef, watch } from "vue";
import { VSystemBar } from "vuetify/components";
import { Stores, useStores } from "../core/store";
import { UniverseUiShardEntries } from "../core/universe-ui";

export default defineComponent({
	components: { VSystemBar },
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
		const store: Stores = useStores();
		// Infer store
		// eslint-disable-next-line @typescript-eslint/typedef
		const { onUpdateGridLevel } = store.useUpdateActionStore();

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
			gridLevels
		};
	}
});
</script>

<style scoped lang="css"></style>
