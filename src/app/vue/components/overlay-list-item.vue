<!--
	Content that goes into overlays, and it's sub-components.
	Accepts items prop JS object that is conditionally interpreted for rendering, determining what goes into which slot.

	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->

<template>
	<!-- Info -->
	<component
		:is="component.is"
		v-bind="component.props"
		v-if="
			item.type === OverlayListItemEntryType.InfoElement ||
			item.type === undefined ||
			item.type === OverlayListItemEntryType.Switch ||
			item.type === OverlayListItemEntryType.Slot
		"
	>
		<!-- Slots would still need to be further filtered down the line, but can at least skip when it is known they won't be used -->
		<!-- Preserve parent component for slots -->
		<!-- eslint-disable-next-line vue/no-use-v-if-with-v-for -->
		<template v-for="name in component.slots" #[name]="props">
			<slot :name="name" v-bind="props" />
		</template>
	</component>

	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		v-else
		:icon="item.icon"
		:name="item.name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Content slot --->
		<template
			v-if="
				[OverlayListItemEntryType.Uuid, OverlayListItemEntryType.Tab, OverlayListItemEntryType.Slot].includes(item.type)
			"
			#content
		>
			<!-- Uuid element -->
			<highlightjs v-if="item.type === OverlayListItemEntryType.Uuid" language="plaintext" :code="item.uuid" />

			<!-- Tab element -->
			<!-- Key is bound to array, so that change of array triggers redraw of tabs, effectively displaying new window item, since the window item previously displayed might have been redrawn due to change of it's own contents -->
			<template v-if="item.type === OverlayListItemEntryType.Tab">
				<!-- Menu -->
				<template v-if="isMenu">
					<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
						<template v-for="(tab, tabKey) in item.tabs" :key="tabKey">
							<OverlayListItemAssembler :name="tab.name" :content-type="contentType">
								<template #content>
									<OverlayList :items="tab.items" :content-type="contentType">
										<template v-for="slot in getSlots(tab)" #[slot]>
											<slot :name="slot" />
										</template>
									</OverlayList>
								</template>
							</OverlayListItemAssembler>
						</template>
					</VList>
				</template>

				<!-- Block -->
				<template v-else>
					<VTabs
						:key="item.tabs"
						:model-value="getTab({ tabs: item.tabs })"
						@update:model-value="
							value => {
								if (value === null || typeof value === 'number') {
									setTab({ tabs: item.tabs, value });
								}
							}
						"
					>
						<VTab v-for="(tab, tabKey) in item.tabs" :key="tabKey" :value="tabKey">{{ tab.name }}</VTab>
					</VTabs>

					<VWindow
						:model-value="getTab({ tabs: item.tabs })"
						@update:model-value="value => setTab({ tabs: item.tabs, value })"
					>
						<VWindowItem v-for="(tab, tabKey) in item.tabs" :key="tabKey" :value="tabKey">
							<OverlayList :items="tab.items" :content-type="contentType">
								<template v-for="slot in getSlots(tab)" #[slot]>
									<slot :name="slot" />
								</template>
							</OverlayList>
						</VWindowItem>
					</VWindow>
				</template>
			</template>
		</template>
	</OverlayListItemAssembler>

	<template v-if="!isLast">
		<VDivider />
	</template>
</template>

<script lang="ts">
import { ComponentOptions, DefineComponent, PropType, defineAsyncComponent, defineComponent } from "vue";
import { VChip, VDivider, VList, VSwitch, VTab, VTabs, VWindow, VWindowItem } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import {
	ElementSize,
	OverlayListItemEntry as Item,
	OverlayListItemEntryType,
	OverlayType,
	OverlayContentTabs as Tabs,
	overlayListChildSharedProps,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import { OverlayListItemAssembler, OverlayListItemInfo, OverlayListItemSlot, OverlayListItemSwitch } from ".";

/**
 * Async component for overlay list, since it's circular dependency.
 */
// BUG: Inference doesn't like circular dependencies, so we manually define component type
const OverlayList: DefineComponent = defineAsyncComponent(
	() => import("./overlay-list.vue")
) as unknown as DefineComponent;

/**
 * Element size pixels.
 */
type ElementSizePixels = {
	[Key in ElementSize]?: number;
};

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
};

export default defineComponent({
	components: {
		OverlayList,
		OverlayListItemAssembler,
		OverlayListItemInfo,
		OverlayListItemSwitch,
		VChip,
		VDivider,
		VList,
		VSwitch,
		VTab,
		VTabs,
		VWindow,
		VWindowItem
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
				isHiddenCaretDisplayedIfMissing: this.isHiddenCaretDisplayedIfMissing,
				isHiddenIconDisplayedIfMissing: this.isHiddenIconDisplayedIfMissing,
				isLast: this.isLast,
				item: this.item
			};
			const { item } = props;
			/* eslint-enable @typescript-eslint/typedef */
			switch (item.type) {
				case undefined:
				case OverlayListItemEntryType.InfoElement:
					return {
						is: OverlayListItemInfo,
						props: props as NarrowProps<typeof item>,
						slots: []
					};

				case OverlayListItemEntryType.Switch:
					return {
						is: OverlayListItemSwitch,
						props: props as NarrowProps<typeof item>,
						slots: []
					};

				case OverlayListItemEntryType.Tab:
					return {
						is: {},
						props: {}
					} as never;

				case OverlayListItemEntryType.Slot:
					return {
						is: OverlayListItemSlot,
						props: props as NarrowProps<typeof item>,
						slots: [item.id]
					};

				case OverlayListItemEntryType.Uuid:
					return {
						is: {},
						props: {}
					} as never;

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
		},

		/**
		 * Get the records.
		 *
		 * @returns Records
		 */
		records(): ThisVueStore["$store"]["state"]["records"] {
			return (this as unknown as ThisVueStore).$store.state.records;
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
			OverlayListItemEntryType,
			defaultElementSize: ElementSize.Medium,
			// Fallback when the size in pixels is not defined for the element size
			defaultElementSizePixels: 300,
			sizes,
			tab2: null,
			tabFallBack: null,
			tabs: new Map<Tabs, number | null>()
		};
	},

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
				.filter(item => item.type === OverlayListItemEntryType.Slot || item.type === OverlayListItemEntryType.Tab)
				.forEach(item => {
					if (item.type === OverlayListItemEntryType.Slot) {
						result.add(item.id);
						return;
					}

					// Filter guarantees narrowing
					(
						item as Item & {
							/**
							 * Tab type.
							 */
							type: OverlayListItemEntryType.Tab;
						}
					).tabs.forEach(tab => {
						result = new Set([...result, ...this.getSlots(tab)]);
					});
				});
			return result;
		},

		/**
		 * Get the tab.
		 *
		 * @param param - Tabs
		 * @returns Tab
		 */
		getTab({
			tabs
		}: {
			/**
			 * Tabs to get active tab for.
			 */
			tabs: Tabs;
		}): number | null {
			return this.tabs.get(tabs) ?? this.tabFallBack;
		},

		/**
		 * Sets the record in the store.
		 *
		 * @param v - Destructured parameter
		 */
		setRecord(v: {
			/**
			 * ID.
			 */
			id: string;
			/**
			 * Value.
			 */
			value: boolean;
		}) {
			(this as unknown as ThisVueStore).$store.commit("recordMutation", v);
		},

		/**
		 * Set the key of active tab.
		 *
		 * @param param - Tabs and value
		 */
		setTab({
			tabs,
			value
		}: {
			/**
			 * Tabs.
			 */
			tabs: Tabs;

			/**
			 * Value.
			 */
			value: number | null;
		}): void {
			this.tabs.set(tabs, value);
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

	name: "OverlayListItem",

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
