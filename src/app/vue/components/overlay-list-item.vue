<!--
	Content that goes into overlays, and it's sub-components.
	Accepts items prop JS object that is conditionally interpreted for rendering, determining what goes into which slot.

	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->

<template>
	<!-- Info -->
	<component :is="component.is" v-bind="component.props">
		<!-- Slots would still need to be further filtered down the line, but can at least skip when it is known they won't be used -->
		<!-- Preserve parent component for slots -->
		<!-- eslint-disable-next-line vue/no-use-v-if-with-v-for -->
		<template v-for="name in component.slots" #[name]="props">
			<slot :name="name" v-bind="props" />
		</template>
	</component>
	<template v-if="!isLast">
		<VDivider />
	</template>
</template>

<script lang="ts">
import { ComponentOptions, PropType, defineComponent } from "vue";
import { VDivider } from "vuetify/components";
import {
	OverlayListItemEntry as Item,
	OverlayListItemEntryType,
	OverlayType,
	overlayListChildSharedProps,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import {
	OverlayListItemInfo,
	OverlayListItemList,
	OverlayListItemSlot,
	OverlayListItemSwitch,
	OverlayListItemTab,
	OverlayListItemUuid
} from ".";

/**
 * Components indexed by type.
 */
type ComponentIndex = {
	/**
	 * Info.
	 */
	[OverlayListItemEntryType.InfoElement]: typeof OverlayListItemInfo;

	/**
	 * Switch.
	 */
	[OverlayListItemEntryType.Switch]: typeof OverlayListItemSwitch;

	/**
	 * Slot.
	 */
	[OverlayListItemEntryType.Slot]: typeof OverlayListItemSlot;

	/**
	 * UUID.
	 */
	[OverlayListItemEntryType.Uuid]: typeof OverlayListItemUuid;

	/**
	 * Tab.
	 */
	[OverlayListItemEntryType.Tab]: typeof OverlayListItemTab;

	/**
	 * List.
	 */
	[OverlayListItemEntryType.List]: typeof OverlayListItemList;
};

export default defineComponent({
	components: {
		VDivider
	},

	computed: {
		/**
		 * Component information to use.
		 *
		 * @remarks
		 * Implicit exhaustiveness is checked by item type, and prop type consistency is checked by return type.
		 *
		 * @returns Component object with `is` and props
		 */
		// ts(2366) will guarantee return
		// eslint-disable-next-line vue/return-in-computed-property, consistent-return
		component(): {
			[K in keyof ComponentIndex]: {
				/**
				 * Component itself.
				 */
				is: ComponentIndex[K];

				/**
				 * Props to provide to component.
				 */
				props: ComponentIndex[K] extends ComponentOptions<infer R> ? R : never;

				/**
				 * Slots to pass.
				 */
				slots: Array<string>;
			};
		}[keyof ComponentIndex] {
			/**
			 * Narrows props object.
			 */
			type NarrowProps<Type extends typeof item> = typeof props & {
				/**
				 * Item.
				 */
				item: Type;
			};

			// Infer for return
			/* eslint-disable @typescript-eslint/typedef */
			const props = {
				contentType: this.contentType,
				icon: this.item.icon,
				isCompact: this.isCompact,
				isHiddenCaretDisplayedIfMissing: this.isHiddenCaretDisplayedIfMissing,
				isHiddenIconDisplayedIfMissing: this.isHiddenIconDisplayedIfMissing,
				isLast: this.isLast,
				item: this.item,
				name: this.item.name
			};
			const { item } = props;
			/* eslint-enable @typescript-eslint/typedef */
			switch (item.type) {
				case undefined:
				case OverlayListItemEntryType.InfoElement:
					return {
						is: OverlayListItemInfo,
						props: { ...props, data: item.data },
						slots: []
					};

				case OverlayListItemEntryType.Switch:
					return {
						is: OverlayListItemSwitch,
						props: { ...props, id: item.id },
						slots: []
					};

				case OverlayListItemEntryType.Tab:
					return {
						is: OverlayListItemTab,
						props: { ...props, tabs: item.tabs },
						slots: Object.keys(this.$slots)
					};

				case OverlayListItemEntryType.Slot:
					return {
						is: OverlayListItemSlot,
						props: { ...props, id: item.id },
						slots: [item.id]
					};

				case OverlayListItemEntryType.Uuid:
					return {
						is: OverlayListItemUuid,
						props: { ...props, uuid: item.uuid },
						slots: []
					};

				case OverlayListItemEntryType.List:
					return {
						is: OverlayListItemList,
						props: { ...props, items: item.items },
						slots: Object.keys(this.$slots)
					};

				// no default
			}
		},

		/**
		 * Whether the item is displayed as a menu.
		 *
		 * @returns Whether the item is displayed as a menu
		 */
		isMenu(): boolean {
			return this.contentType === OverlayType.Menu;
		}
	},

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		isCompact: {
			default: false,
			required: false,
			type: Boolean
		},
		item: {
			required: true,
			type: Object as PropType<Item>
		},
		...overlayListSharedProps,
		...overlayListChildSharedProps
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

<style scoped>
::-webkit-scrollbar {
	width: 10px;
}

::-webkit-scrollbar-track {
	background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
	background: #888;
}

::-webkit-scrollbar-thumb:hover {
	background: #555;
}

.overlay-content-icon-dummy {
	visibility: hidden;
}
</style>
