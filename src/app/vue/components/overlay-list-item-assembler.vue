<!--
	Decorates contents of an item.
	Prepares what to display, unaware of content.
-->

<template>
	<OverlayContentItemWrapper :content-type="contentType" :list-item-class="{ 'pr-1': isCaretDisplayed }">
		<template v-if="hasHeader" #header>
			<!-- `VRow` doesn't receive list's density -->
			<VRow align="center" :dense="isCompact">
				<VCol v-if="effectiveIcon" cols="auto">
					<VIcon :icon="effectiveIcon" class="overlay-content-item-icon" />
				</VCol>

				<VCol cols="auto">
					<VListItemTitle>
						{{ name ? name : "🥕🐇" }}
					</VListItemTitle>
				</VCol>

				<VSpacer />

				<VCol v-if="$slots.inline" cols="auto" :class="{ 'pr-0': isCaretDisplayed }">
					<slot name="inline" />
				</VCol>

				<VCol v-if="isCaretDisplayed" cols="auto" class="overlay-content-item-caret pl-0">
					<VIcon :icon="'fa-caret-right'" />
				</VCol>
			</VRow>
		</template>

		<!-- Content slot -->
		<template v-if="$slots.content" #content>
			<slot v-if="$slots.content" name="content" />
		</template>
	</OverlayContentItemWrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCol, VIcon, VListItemTitle, VRow, VSpacer } from "vuetify/components";
import {
	OverlayListType,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import OverlayContentItemWrapper from "./overlay-list-item-wrapper.vue";

export default defineComponent({
	components: {
		OverlayContentItemWrapper,
		VCol,
		VIcon,
		VListItemTitle,
		VRow,
		VSpacer
	},

	/**
	 * Computed.
	 */
	computed: {
		/**
		 * Shows effective icon to display.
		 * Controls if icon displayed in the first place.
		 *
		 * @returns Effective icon
		 */
		effectiveIcon(): string | undefined {
			if (this.icon) {
				return this.icon;
			}
			if (this.isHiddenIconDisplayedIfMissing) {
				return "fa-carrot";
			}
			return undefined;
		},

		/**
		 * Determines if header is displayed.
		 * Will be forced for non block content type.
		 *
		 * @returns Whether to display a header
		 */
		hasHeader(): boolean {
			// Skips empty blocks
			return !(this.contentType === OverlayListType.Block && this.isHeaderEmpty);
		},

		/**
		 * Whether the item is displayed as a menu.
		 *
		 * @returns Whether the item is displayed as a menu
		 */
		isCaretDisplayed(): boolean {
			return (!!this.$slots.content && this.isMenu) || this.isHiddenCaretDisplayedIfMissing;
		},

		/**
		 * Whether the caret is visible a menu.
		 *
		 * @returns Whether the caret is visible
		 */
		isCaretVisible(): boolean {
			return !!this.$slots.content && this.isMenu;
		},

		/**
		 * Determines if header is empty.
		 *
		 * @returns Whether header is empty
		 */
		isHeaderEmpty(): boolean {
			return !this.icon && !this.name && !this.$slots.inline;
		},

		/**
		 * Whether icon should be visible.
		 *
		 * @returns Whether icon should be visible
		 */
		isIconVisible(): boolean {
			return !!this.icon;
		}
	},

	emits: overlayListSharedEmits,

	name: "OverlayListItemAssembler",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps
	},

	/**
	 * Setup.
	 *
	 * @param props - Component props
	 * @param param - Context
	 * @returns Composable methods
	 */
	// Infer prop type
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return useOverlayListShared({ emit, props });
	}
});
</script>

<style scoped lang="css">
.overlay-content-item-icon {
	visibility: v-bind("isIconVisible ? 'visible' : 'hidden'");
}
.overlay-content-item-caret {
	visibility: v-bind("isCaretVisible ? 'visible' : 'hidden'");
}
</style>
