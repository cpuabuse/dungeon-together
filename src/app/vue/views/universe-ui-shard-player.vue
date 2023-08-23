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
import { ThisVueStore, UniverseState } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { StatusNotification } from "../components";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";
import { UniverseUiPlayerModel } from "../core/universe-ui";

export default defineComponent({
	components: { StatusNotification },

	/**
	 * Created callback.
	 *
	 * @remarks
	 * Initial model update is not necessary, as parent created model with correct data, but if that changes, model update must be added.
	 */
	created() {
		this.unsubscribeUpdateModel = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updatePlayerDictionary") {
				this.updateModel();
			}
		});
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		const { universe }: UniverseState = (this as unknown as ThisVueStore).$store.state;
		return {
			universe,
			unsubscribeUpdateModel: null as (() => void) | null
		};
	},

	emits: ["update:modelValue", ...statusNotificationEmits],

	methods: {
		/**
		 * Update player entries data.
		 */
		updateModel(): void {
			this.$emit("update:modelValue", {
				// Dictionary would have to be a new object, set by connection, so just asssignment is enough
				dictionary: this.player.dictionary
			} satisfies UniverseUiPlayerModel);
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
	setup(props, ctx) {
		return useStatusNotification(ctx);
	},

	/**
	 * Unmounted callback.
	 */
	unmounted() {
		if (this.unsubscribeUpdateModel) {
			this.unsubscribeUpdateModel();
		}
	}
});
</script>

<style scoped lang="css"></style>
