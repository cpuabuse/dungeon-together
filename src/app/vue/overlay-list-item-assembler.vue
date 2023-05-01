<!--
	Decorates contents of an item.
	Prepares what to display, unaware of content.
-->

<template>
	<OverlayContentItemContainer :content-type="contentType" :list-item-class="{ 'pr-1': isCaretDisplayed }">
		<template v-if="hasHeader" #header>
			<VRow align="center">
				<VCol v-if="effectiveIcon" cols="auto">
					<VIcon :icon="effectiveIcon" class="overlay-content-item-icon" />
				</VCol>

				<VCol v-if="name" cols="auto">
					<VListItemTitle>
						{{ name }}
					</VListItemTitle>
				</VCol>

				<VSpacer />

				<!-- Caret forces data move right -->
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
	</OverlayContentItemContainer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VCol, VIcon, VListItemTitle, VRow, VSpacer } from "vuetify/components";
import OverlayContentItemContainer from "./overlay-list-item-wrapper.vue";
import { OverlayContentType, overlayContentProps } from "./util";

export default defineComponent({
	components: {
		OverlayContentItemContainer,
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
			return !(this.contentType === OverlayContentType.Block && this.isHeaderEmpty);
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
		},

		/**
		 * Whether the item is displayed as a menu.
		 *
		 * @returns Whether the item is displayed as a menu
		 */
		isMenu(): boolean {
			return this.contentType === OverlayContentType.Menu;
		}
	},

	name: "OverlayListItemAssembler",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		icon: { default: undefined, type: String },
		isHiddenCaretDisplayedIfMissing: { default: false, type: Boolean },
		isHiddenIconDisplayedIfMissing: { default: false, type: Boolean },
		name: {
			default: undefined,
			type: String
		},
		...overlayContentProps
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
