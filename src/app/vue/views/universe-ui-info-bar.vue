<!-- Universe UI bar -->
<template>
	<VSystemBar>
		<span v-for="(level, levelKey) in gridLevels" :key="levelKey">{{ level }}</span>
	</VSystemBar>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VSystemBar } from "vuetify/components";
import { UniverseUiShardEntries } from "../core/universe-ui";

export default defineComponent({
	components: { VSystemBar },
	computed: {
		/**
		 * Grid levels.
		 *
		 * @returns Grid levels
		 */
		gridLevels(): Array<number> {
			return (
				this.shardEntries
					// ESlint does not infer
					// eslint-disable-next-line @typescript-eslint/typedef
					.map(([, { shard }]) => {
						// ESlint does not infer
						// eslint-disable-next-line @typescript-eslint/typedef
						return Array.from(shard.grids).map(([, grid]) => {
							return grid.currentLevel;
						});
					})
					.flat()
			);
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
			type: Array as PropType<UniverseUiShardEntries>
		}
	}
});
</script>

<style scoped lang="css"></style>
