<!-- Story notification content -->
<template>
	<div v-for="(paragraph, paragraphKey) in paragraphs" :key="paragraphKey">
		{{ paragraph }}
	</div>
</template>

<script setup lang="ts">
import { ComputedRef, computed } from "vue";
import { useLocale } from "../core/locale";

/**
 * Locale composable.
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/typedef
const { tm, rt } = useLocale();

/**
 * Translated paragraphs.
 */
const paragraphs: ComputedRef<Array<string>> = computed(() => tm("storyNotification.sync.paragraphs").map(rt));
</script>
