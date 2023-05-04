<!-- 
	Content that goes into overlays, and it's sub-components.
	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->
<template>
	<OverlayListBody :content-type="contentType">
		<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<OverlayListItem
					:item="item"
					:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
					:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
					:items="items"
					:content-type="contentType"
					:is-last="itemKey + 1 >= items.length"
					:is-compact="isCompact"
				>
					<!-- Rather blank than underscore -->
					<!-- eslint-disable-next-line vue/valid-v-for -->
					<template v-for="(slot, name) in $slots">
						<slot :name="name" />
					</template>
				</OverlayListItem>
			</template>
		</VList>
	</OverlayListBody>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VList } from "vuetify/components";
import { OverlayWindowItemType as ItemType } from "../common/front";
import { overlayListProps, useOverlayListShared } from "./core/overlay";
import { OverlayContentItem } from "./types";
import { OverlayListBody, OverlayListItem } from ".";

export default defineComponent({
	components: {
		OverlayListBody,
		OverlayListItem,
		VList
	},

	computed: {
		/**
		 * Whether if hidden caret is displayed if missing.
		 *
		 * @returns Whether if hidden caret is displayed if missing
		 */
		isHiddenCaretDisplayedIfMissing(): boolean {
			return this.items.some(itemElement => itemElement.type === ItemType.Tab && itemElement?.data);
		},

		/**
		 * Whether if hidden icon is displayed if missing.
		 *
		 * @returns Whether if hidden icon is displayed if missing
		 */
		isHiddenIconDisplayedIfMissing(): boolean {
			return this.items.some(itemElement => itemElement.icon);
		}
	},

	name: "OverlayList",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		items: { required: true, type: Array as PropType<Array<OverlayContentItem>> },

		...overlayListProps
	},

	/**
	 * Setup function.
	 *
	 * @param props - Reactive props
	 * @returns Props and other
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return useOverlayListShared({ props });
	}
});
</script>
