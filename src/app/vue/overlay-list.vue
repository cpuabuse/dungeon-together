<!-- 
	Content that goes into overlays, and it's sub-components.
	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->
<template>
	<OverlayListBody :content-type="contentType">
		<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<OverlayListItem
					v-bind="{
						...staticProps,
						item,
						isHiddenIconDisplayedIfMissing,
						isHiddenCaretDisplayedIfMissing,
						isLast: itemKey + 1 >= items.length
					}"
				>
					<!-- Since slots would need to be further filtered down the line, pass all -->
					<template v-for="(slot, name) in $slots" #[name]="props">
						<slot :name="name" v-bind="props" />
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
import { overlayListSharedProps, useOverlayListShared } from "./core/overlay";
import { OverlayContentItem as Item } from "./types";
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
		items: { required: true, type: Array as PropType<Array<Item>> },

		...overlayListSharedProps
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
