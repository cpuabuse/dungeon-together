<!-- Provides a card wrapper -->
<template>
	<VCard v-if="isCardWrapped" class="overflow-hidden w-100" :rounded="isMenu ? 'sm' : true">
		<slot />
	</VCard>

	<template v-else>
		<slot />
	</template>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { VCard } from "vuetify/components";
import { OverlayListProps, overlayListProps, useOverlayListShared } from "./core/overlay";

/**
 * Props.
 */
const props: OverlayListProps = defineProps({
	...overlayListProps
});

/**
 * Shared logic.
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
const { isCardWrapped, isMenu } = useOverlayListShared({ props });
</script>
