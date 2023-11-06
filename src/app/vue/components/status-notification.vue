<!--
	Status notification.
	There is the source array coming from the parent. It is synchronized with the display array.
	Children manage respective value deletions in display array.
-->

<template>
	<div class="d-flex status-notification">
		<VScrollYTransition group>
			<!-- Asserting `notificationParameters` as there is no overload for undefined, yet it should work with the potential argument checks of the translation library -->
			<StatusNotificationItem
				v-for="({ notificationId, notificationParameters, uuid }, index) in notificationEntries"
				:key="uuid"
				:text="t(`statusNotification.${notificationId}`, notificationParameters!)"
				@timeout="() => timeout({ index })"
			/>
		</VScrollYTransition>
	</div>
</template>

<script lang="ts">
import { v4 } from "uuid";
import { PropType, defineComponent } from "vue";
import { VScrollYTransition } from "vuetify/components";
import { StatusNotification } from "../../client/connection";
import { ThisVueStore } from "../../client/gui";
import { Uuid } from "../../common/uuid";
import { useLocale } from "../core/locale";
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
			return this.notifications.length;
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
			notificationEntries: new Array<
				StatusNotification & {
					/**
					 *Uuid.
					 *
					 * @returns Uuid
					 */
					uuid: Uuid;
				}
			>(),
			unsubscribeUpdateNotifications: null as (() => void) | null
		};
	},

	emits: statusNotificationEmits,

	methods: {
		/**
		 * Method to synchronize notifications.
		 */
		synchronizeNotifications(): void {
			for (; this.notificationEntries.length < this.maxNotificationEntries && this.notifications.length > 0; ) {
				this.notificationEntries.push({
					// TODO: Change notification type
					// Since array length is more than 0, always defined
					/* eslint-disable @typescript-eslint/no-non-null-assertion */
					notificationId: this.notifications[0]!.notificationId,
					notificationParameters: this.notifications[0]!.notificationParameters,
					/* eslint-enable @typescript-eslint/no-non-null-assertion */
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
		notifications: {
			required: true,
			type: Array as PropType<Array<StatusNotification>>
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
		return { ...useStatusNotification(ctx), ...useLocale() };
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
