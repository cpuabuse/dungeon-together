<!-- Story notification content -->
<template>
	<VRow v-for="({ paragraphs }, displayItemKey) in displayItems" :key="displayItemKey">
		<VCol>
			<p v-for="(paragraph, paragraphKey) in paragraphs" :key="paragraphKey">
				{{ paragraph }}
			</p>
		</VCol>
	</VRow>
</template>

<script setup lang="ts">
import { Ref, computed } from "vue";
import { VCol, VRow } from "vuetify/components";
import { useLocale } from "../core/locale";
import { StoryNotificationEntry } from "../core/story-notification";

/**
 * Locale composable.
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/typedef
const { tm, rt } = useLocale();

/**
 * Props.
 */
// Infer props type
// eslint-disable-next-line @typescript-eslint/typedef
const props = defineProps<{
	/**
	 * Story notification entries.
	 */
	storyNotificationEntries: Array<StoryNotificationEntry>;
}>();

/**
 * Display items.
 */
const displayItems: Ref<
	Array<{
		/**
		 * Translated paragraphs.
		 */
		paragraphs: Array<string>;
	}>
> = computed(() => {
	// ESLint does not infer
	// eslint-disable-next-line @typescript-eslint/typedef
	return props.storyNotificationEntries.map(({ notificationId }) => {
		return {
			paragraphs: tm(`storyNotification.${notificationId}.paragraphs`).map(rt)
		};
	});
});
</script>
