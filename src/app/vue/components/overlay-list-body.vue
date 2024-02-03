<!-- Provides a card wrapper -->
<template>
	<div>
		<!-- Rounded condition is not necessary as `v-if` would be true only when `isMenu` is true, but it is left intentionally -->
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
import {
	OverlayListSharedProps,
	OverlayListSharedPropsReceived,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";

/**
 * Props.
 */
const props: OverlayListSharedPropsReceived = defineProps({
	...overlayListSharedProps
});

/**
 * Emits.
 */
// Force infer
// eslint-disable-next-line @typescript-eslint/typedef
const emit = defineEmits(overlayListSharedEmits);

/**
 * Shared logic.
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
const { isCardWrapped, isMenu } = useOverlayListShared({ emit, props });
</script>
