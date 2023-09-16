<!--
	Status notification.
	There is the source array coming from the parent. It is synchronized with the display array.
	Children manage respective value deletions in display array.
-->

<template>
	<div class="d-flex status-notification">
		<VScrollYTransition group>
			<StatusNotificationItem
				v-for="({ text, uuid }, index) in notificationEntries"
				:key="uuid"
				:text="text"
				@timeout="() => timeout({ index })"
			/>
		</VScrollYTransition>
	</div>
</template>

<script lang="ts">
import { v4 } from "uuid";
import { PropType, defineComponent } from "vue";
import { VScrollYTransition } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";
import StatusNotificationItem from "./status-notification-item.vue";

export default defineComponent({
	components: { StatusNotificationItem, VScrollYTransition },

	computed: {
		/**
		 *Notification IDs length.
		 *
		 @returns Notification IDs length
		 */
		notificationIdsLength(): number {
			return this.notificationIds.length;
		}
	},

	/**
	 * Created callback.
	 *
	 * @remarks
	 * Initial model update is not necessary, as parent created model with correct data, but if that changes, model update must be added.
	 */
	created() {
		// Synchronize notifications initially
		this.synchronizeNotifications();

		this.unsubscribeUpdateNotifications = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updateNotifications") {
				this.synchronizeNotifications();
			}
		});
	},

	/**
	 *Data.
	 *
	 * @returns Data
	 */
	data() {
		return {
			maxNotificationEntries: 5,
			notificationEntries: new Array<{
				/**
				 *Text.
				 *
				 * @returns Text
				 */
				text: string;

				/**
				 *Uuid.
				 *
				 * @returns Uuid
				 */
				uuid: Uuid;
			}>(),
			unsubscribeUpdateNotifications: null as (() => void) | null
		};
	},

	emits: statusNotificationEmits,

	methods: {
		/**
		 *Method to synchronize notifications.
		 */
		synchronizeNotifications(): void {
			for (; this.notificationEntries.length < this.maxNotificationEntries && this.notificationIds.length > 0; ) {
				this.notificationEntries.push({
					// Since array length is more than 0, always defined
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					text: this.notificationIds[0]!,
					uuid: v4()
				});
				this.shiftPlayerNotifications();
			}
		},

		/**
		 * Timeout callback.
		 *
		 * @param notificationId - Notification ID
		 */
		timeout({
			index
		}: {
			/**
			 *Index.
			 *
			 * @returns Index
			 */
			index: number;
		}): void {
			this.notificationEntries.splice(index, 1);
			this.synchronizeNotifications();
		}
	},

	props: {
		notificationIds: {
			required: true,
			type: Array as PropType<Array<string>>
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
		if (this.unsubscribeUpdateNotifications) {
			this.unsubscribeUpdateNotifications();
		}
	}
});
</script>

<style scoped lang="css">
.status-notification {
	flex-direction: column-reverse;
}

/* `VAlert` by default fills */
.status-notification > :deep(*) {
	flex-grow: 0;
	margin-bottom: 0.5em;
}
</style>
