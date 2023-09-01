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
					@ui-action="emitUiAction"
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
import {
	OverlayListItemEntryType,
	OverlayListItems,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import OverlayListBody from "./overlay-list-body.vue";
import OverlayListItem from "./overlay-list-item.vue";

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
			return this.items.some(
				itemElement =>
					itemElement?.data &&
					(
						[OverlayListItemEntryType.Tab, OverlayListItemEntryType.Uuid, OverlayListItemEntryType.List] as Array<
							OverlayListItemEntryType | undefined
						>
					).includes(itemElement.type)
			);
		},

		/**
		 * Whether if hidden icon is displayed if missing.
		 *
		 * @returns Whether if hidden icon is displayed if missing
		 */
		isHiddenIconDisplayedIfMissing(): boolean {
			return this.items.some(itemElement => itemElement.icon || itemElement.modeUuid);
		}
	},

	name: "OverlayList",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		items: { required: true, type: Array as PropType<OverlayListItems> },

		...overlayListSharedProps
	},

	/**
	 * Setup function.
	 *
	 * @param props - Reactive props
	 * @param param - Context
	 * @returns Props and other
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return useOverlayListShared({ emit, props });
	}
});
</script>
