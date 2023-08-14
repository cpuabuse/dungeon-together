<!--
	Content that goes into overlays, and it's sub-components.
	Accepts items prop JS object that is conditionally interpreted for rendering, determining what goes into which slot.

	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->

<template>
	<!-- Tab element -->
	<!-- Key is bound to array, so that change of array triggers redraw of tabs, effectively displaying new window item, since the window item previously displayed might have been redrawn due to change of it's own contents -->
	<!-- Menu -->
	<template v-if="isMenu">
		<OverlayListItemList
			v-bind="{ items: menuItems, ...assemblerProps }"
			@ui-action="emitUiAction"
		></OverlayListItemList>
	</template>

	<OverlayListItemAssembler v-else v-bind="assemblerProps" is-header-centered @ui-action="emitUiAction">
		<!-- Content slot --->
		<template #content>
			<!-- Block; Only name is used, rest is ignored -->
			<VTabs v-model="activeTabId" align-tabs="center">
				<VTab v-for="(tab, tabKey) in tabs" :key="tabKey" :value="tabKey">{{ tab.name }}</VTab>
			</VTabs>

			<VWindow v-model="activeTabId">
				<VWindowItem v-for="(tab, tabKey) in tabs" :key="tabKey" :value="tabKey">
					<OverlayList :items="tab.items" :content-type="contentType" @ui-action="emitUiAction">
						<template v-for="slot in getSlots(tab)" #[slot]>
							<slot :name="slot" />
						</template>
					</OverlayList>
				</VWindowItem>
			</VWindow>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineAsyncComponent, defineComponent } from "vue";
import { VTab, VTabs, VWindow, VWindowItem } from "vuetify/components";
import { ElementSize } from "../common/element";
import {
	OverlayListItemEntry as Item,
	OverlayListItemEntryExtract,
	OverlayListItemEntryType,
	OverlayListTabs,
	OverlayListType,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";
import OverlayListItemList from "./overlay-list-item-list.vue";

/**
 * Async component for overlay list, since it's circular dependency.
 */
// Infer component type
// eslint-disable-next-line @typescript-eslint/typedef
const OverlayList = defineAsyncComponent(async () => import("./overlay-list.vue"));

/**
 * Element size pixels.
 */
type ElementSizePixels = {
	[Key in ElementSize]?: number;
};

export default defineComponent({
	components: {
		OverlayList,
		OverlayListItemAssembler,
		OverlayListItemList,
		VTab,
		VTabs,
		VWindow,
		VWindowItem
	},

	computed: {
		/**
		 * Whether the item is displayed as a menu.
		 *
		 * @returns Whether the item is displayed as a menu
		 */
		isMenu(): boolean {
			return this.contentType === OverlayListType.Menu;
		},

		/**
		 * Items for menu.
		 *
		 * @returns Items for menu
		 */
		menuItems(): Array<Item> {
			return this.tabs.map(tab => ({ ...tab, type: OverlayListItemEntryType.List }));
		}
	},

	/**
	 * Data for component.
	 *
	 * @returns Component data
	 */
	data() {
		let sizes: ElementSizePixels = {
			[ElementSize.Small]: 300,
			[ElementSize.Medium]: 500,
			[ElementSize.Large]: 700
		};

		return {
			activeTabId: 0,
			defaultElementSize: ElementSize.Medium,
			// Fallback when the size in pixels is not defined for the element size
			defaultElementSizePixels: 300,
			sizes
		};
	},

	emits: overlayListSharedEmits,

	methods: {
		/**
		 * Determine necessary slot IDs, to pass through to tabs.
		 *
		 * @param param - Destructured object
		 * @returns Set of IDs, required for all grandchildren
		 */
		getSlots({
			items
		}: {
			/**
			 * Items.
			 */
			items: Array<Item>;
		}): Set<string> {
			let result: Set<string> = new Set();
			items
				.filter(
					(item): item is OverlayListItemEntryExtract<OverlayListItemEntryType.Tab | OverlayListItemEntryType.Slot> =>
						item.type === OverlayListItemEntryType.Slot || item.type === OverlayListItemEntryType.Tab
				)
				.forEach(item => {
					if (item.type === OverlayListItemEntryType.Slot) {
						result.add(item.id);
						return;
					}

					// Filter guarantees narrowing
					item.tabs.forEach(tab => {
						result = new Set([...result, ...this.getSlots(tab)]);
					});
				});
			return result;
		},

		/**
		 * Style for tab.
		 *
		 * @param param - Destructured object
		 * @returns CSS height in pixels
		 */
		tabStyle({
			size
		}: Item & {
			/**
			 * Tab type.
			 */
			type: OverlayListItemEntryType.Tab;
		}) {
			return {
				// Gets the size in pixels for the element size, or the default size in pixels
				height: `${this.sizes[size ?? this.defaultElementSize] ?? this.defaultElementSizePixels}px`
			};
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

		tabs: {
			required: true,
			type: Array as PropType<OverlayListTabs>
		},

		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps
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
		return { ...useOverlayListShared({ emit, props }), ...useOverlayListItemShared({ props }) };
	}
});
</script>
