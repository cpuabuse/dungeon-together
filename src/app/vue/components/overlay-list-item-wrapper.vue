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
					<VListItem v-bind="props" :class="effectiveListItemClass">
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
			<VListItem v-else :class="effectiveListItemClass">
				<!-- Header slot -->
				<slot v-if="$slots.header" name="header" />
			</VListItem>
		</template>

		<!-- Block -->
		<template v-else>
			<!-- The density will be inherited from `VList` -->
			<VListItem :class="effectiveListItemClass">
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
import { overlayListSharedEmits, overlayListSharedProps, useOverlayListShared } from "../core/overlay";

export default defineComponent({
	components: { VListItem, VMenu },

	computed: {
		/**
		 * Effective class applied to list item.
		 *
		 * @remarks
		 * Reduce the ending padding for asymmetric visual design. When not compact leave at default.
		 *
		 * @returns Class object
		 */
		effectiveListItemClass(): Record<string, boolean> {
			return {
				"pe-1": this.isCompact,
				"ps-2": this.isCompact,
				...this.listItemClass
			};
		}
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return { isMenuOpen: false };
	},

	emits: overlayListSharedEmits,

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
	 * @param param - Context
	 * @returns Composable methods
	 */
	// Infer props
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return useOverlayListShared({ emit, props });
	}
});
</script>
