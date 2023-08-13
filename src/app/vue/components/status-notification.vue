<!--
	Status notification.
	There is the source array coming from the parent. It is synchronized with the display array.
	Children manage respective value deletions in display array.
-->

<template>
	<StatusNotificationItem
		v-for="({ text, uuid }, index) in notificationEntries"
		:key="uuid"
		:text="text"
		@timeout="() => timeout({ index })"
	/>
</template>

<script lang="ts">
import { v4 } from "uuid";
import { PropType, defineComponent } from "vue";
import { Uuid } from "../../common/uuid";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";
import StatusNotificationItem from "./status-notification-item.vue";

export default defineComponent({
	components: { StatusNotificationItem },

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
			}>()
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

	watch: {
		/**
		 * Watching for length of notification array.
		 */
		notificationIdsLength: {
			/**
			 * Handler.
			 */
			handler(): void {
				this.synchronizeNotifications();
			},
			immediate: true
		}
	}
});
</script>
