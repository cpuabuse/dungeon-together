<!--
	Helper component.
	Determines how to display the item's slots.
-->

<template>
	<div>
		<!-- Menu -->
		<template v-if="isMenu">
			<!-- Expanding menu -->
			<VMenu v-if="$slots.content" v-model="isMenuOpen" location="end" :close-on-content-click="false">
				<template #activator="{ props }">
					<!-- The density will be inherited from `VList` -->
					<VListItem v-bind="mergeProps(props, { class: listItemClass })">
						<!-- Header slot -->
						<!-- Produce prop if expanded -->
						<slot name="header" :is-expanded="isMenuOpen" />
					</VListItem>
				</template>

				<!-- Content slot -->
				<!-- Make popup menus smaller rounding -->
				<slot v-if="$slots.content" name="content" />
			</VMenu>

			<!-- Info only -->
			<!-- Tonal for non interactive element -->
			<!-- The density will be inherited from `VList` -->
			<VListItem v-else :class="listItemClass">
				<!-- Header slot -->
				<slot v-if="$slots.header" name="header" />
			</VListItem>
		</template>

		<!-- Block -->
		<template v-else>
			<!-- The density will be inherited from `VList` -->
			<VListItem :class="listItemClass">
				<!-- Header slot -->
				<slot v-if="$slots.header" name="header" />

				<!-- Content slot -->
				<slot v-if="$slots.content" name="content" />
			</VListItem>
		</template>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent, mergeProps } from "vue";
import { VListItem, VMenu } from "vuetify/components";
import { overlayListSharedProps, useOverlayListShared } from "../core/overlay";

export default defineComponent({
	components: { VListItem, VMenu },

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return { isMenuOpen: false };
	},

	methods: {
		mergeProps
	},

	name: "OverlayListItemWrapper",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		...overlayListSharedProps,

		listItemClass: {
			default: new Object(),
			type: Object as PropType<Record<string, boolean>>
		}
	},

	/**
	 * Setup.
	 *
	 * @param props - Props
	 * @returns Composable methods
	 */
	// Infer props
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return useOverlayListShared({ props });
	}
});
</script>
