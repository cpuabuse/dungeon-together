<!-- Universe UI per shard per player -->
<template>
	<div>Player: {{ player.playerUuid }}</div>
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";

export default defineComponent({
	components: {},

	props: {
		player: {
			required: true,
			type: Object as PropType<ClientPlayer>
		},

		shard: {
			required: true,
			type: Object as PropType<ClientShard>
		}
	}
});
</script>

<style scoped lang="css"></style>
