<!-- Universe UI per shard per player -->
<template>
	<StatusNotification
		:notification-ids="player.notificationIds"
		@shift-player-notifications="shiftPlayerNotifications"
	/>
</template>
<script lang="ts">
import { PropType, defineComponent } from "vue";
import { ClientPlayer } from "../../client/connection";
import { ClientShard } from "../../client/shard";
import { StatusNotification } from "../components";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";

export default defineComponent({
	components: { StatusNotification },

	emits: statusNotificationEmits,

	props: {
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
	setup(props, ctx) {
		return useStatusNotification(ctx);
	}
});
</script>

<style scoped lang="css"></style>
