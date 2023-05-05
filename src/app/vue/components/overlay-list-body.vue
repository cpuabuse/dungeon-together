<!-- Provides a card wrapper -->
<template>
	<div>
		<VCard v-if="isCardWrapped" class="overflow-hidden w-100" :rounded="isMenu ? 'sm' : true">
			<slot />
		</VCard>

		<template v-else>
			<slot />
		</template>
	</div>
</template>

<script setup lang="ts">
import { VCard } from "vuetify/components";
import { OverlayListSharedProps, overlayListSharedProps, useOverlayListShared } from "../core/overlay";

/**
 * Props.
 */
const props: OverlayListSharedProps = defineProps({
	...overlayListSharedProps
});

/**
 * Shared logic.
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
const { isCardWrapped, isMenu } = useOverlayListShared({ props });
</script>
