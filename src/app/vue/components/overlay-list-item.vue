<!--
	Content that goes into overlays, and it's sub-components.
	Accepts items prop JS object that is conditionally interpreted for rendering, determining what goes into which slot.

	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->

<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="item.icon"
		:name="item.name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Inline slot -->
		<template
			v-if="[OverlayListItemEntryType.InfoElement, undefined, OverlayListItemEntryType.Switch].includes(item.type)"
			#inline
		>
			<!-- Info element -->
			<VChip v-if="item.type === OverlayListItemEntryType.InfoElement || item.type === undefined">
				{{ item.data }}
			</VChip>

			<!-- Switch element -->
			<VSwitch
				v-if="item.type === OverlayListItemEntryType.Switch"
				:model-value="records[item.id]"
				@update:model-value="
					value => {
						if (typeof value == 'boolean') {
							setRecord({ id: item.id, value });
						}
					}
				"
			/>
		</template>

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

			<!-- Slot element -->
			<slot v-if="item.type === OverlayListItemEntryType.Slot" :name="item.id" />
		</template>
	</OverlayListItemAssembler>

	<template v-if="!isLast">
		<VDivider />
	</template>
</template>

<script lang="ts">
import { DefineComponent, PropType, defineAsyncComponent, defineComponent } from "vue";
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
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

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

export default defineComponent({
	components: {
		OverlayList,
		OverlayListItemAssembler,
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
			OverlayListItemType: OverlayListItemEntryType,
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
