<!-- Universe UI per shard per player -->
<template>
	<StatusNotification
		class="universe-ui-shard-player-status-notification"
		:notification-ids="player.notificationIds"
		@shift-player-notifications="shiftPlayerNotifications"
	/>
	<!-- Story notification -->
	<OverlayWindow v-model="isStoryNotificationMenuDisplayed" icon="fa-list-check" :name="storyNotificationMenuName">
		<template #body>
			<!-- Data type information lost, thus cast -->
			<OverlayList :items="(storyNotificationMenuItems as OverlayListItems)"> </OverlayList>
		</template>
	</OverlayWindow>
</template>
<script lang="ts">
import { PropType, Ref, defineComponent, ref } from "vue";
import { ClientPlayer, StoryNotification } from "../../client/connection";
import { ThisVueStore, UniverseState } from "../../client/gui";
import { ClientShard } from "../../client/shard";
import { OverlayList, StatusNotification } from "../components";
import OverlayWindow from "../components/overlay-window.vue";
import { OverlayListItemEntryType, OverlayListItems } from "../core/overlay";
import { statusNotificationEmits, useStatusNotification } from "../core/status-notification";
import { useRecords } from "../core/store";
import { UniverseUiPlayerModel } from "../core/universe-ui";

/**
 * Type for story notification display.
 */
type StoryNotificationEntry = Pick<StoryNotification, "moduleId" | "notificationId">;

export default defineComponent({
	components: { OverlayList, OverlayWindow, StatusNotification },

	computed: {
		/**
		 * Display story notification menu or not.
		 */
		isStoryNotificationMenuDisplayed: {
			/**
			 * Gets story notification menu display record.
			 *
			 * @returns Boolean value
			 */
			get(): boolean {
				return this.getBooleanRecord({ id: this.storyNotificationMenuDisplaySymbol });
			},

			/**
			 * Sets story notification menu display record.
			 *
			 * @param value - Boolean value to set
			 */
			set(value: boolean) {
				this.records[this.storyNotificationMenuDisplaySymbol] = value;
			}
		},

		/**
		 * Story notification menu items.
		 *
		 * @returns Carcass to display for story notification menu
		 */
		storyNotificationMenuItems(): OverlayListItems {
			return [{ tabs: [{ items: [] }], type: OverlayListItemEntryType.Tab }];
		},

		/**
		 * Name of the story notification menu.
		 *
		 * @returns Menu name
		 */
		storyNotificationMenuName(): string {
			return "Story notification menu name not translated";
		}
	},

	/**
	 * Created callback.
	 *
	 * @remarks
	 * Initial model update is not necessary, as parent created model with correct data, but if that changes, model update must be added.
	 */
	created() {
		this.unsubscribeUpdateModel = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updatePlayerDictionary") {
				this.model = { dictionary: this.player.dictionary };
				this.emitModel();
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
			model: this.modelValue,
			storyNotificationMenuDisplaySymbol: Symbol("story-notification-menu-display"),
			universe,
			unsubscribeUpdateModel: null as (() => void) | null
		};
	},

	emits: ["update:modelValue", ...statusNotificationEmits],

	methods: {
		/**
		 * Update player entries data.
		 */
		emitModel(): void {
			this.$emit("update:modelValue", this.model satisfies UniverseUiPlayerModel);
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
		// Infer composable
		// eslint-disable-next-line @typescript-eslint/typedef
		const { onUpdateStoryNotification, shiftPlayerNotifications } = useStatusNotification(ctx);

		const storyNotificationEntries: Ref<Array<StoryNotificationEntry>> = ref(new Array<StoryNotificationEntry>());

		onUpdateStoryNotification({
			/**
			 * Callback, when story notifications are updated.
			 */
			callback() {
				let { storyNotifications }: ClientPlayer = props.player;
				while (storyNotifications.length > 0) {
					// Array is not empty
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					let storyNofication: StoryNotification = storyNotifications.shift()!;

					storyNotificationEntries.value.push({ ...storyNofication });
				}
			}
		});
		return { ...useRecords(), shiftPlayerNotifications, storyNotificationEntries };
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

<style scoped lang="css">
.universe-ui-shard-player-status-notification {
	position: absolute;
	right: 0;
	bottom: 0;
	max-width: 20%;
	max-height: 20%;
	min-width: 10%;
	min-height: 10%;
	margin: 2em;
}
</style>
