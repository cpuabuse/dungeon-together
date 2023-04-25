<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<div v-show="items.length > 0" :class="{ 'overlay-content-container-compact': isCompact, 'overflow-auto': true }">
		<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<!-- The density will be inherited from `VList` -->
				<VListItem :class="{ 'pa-0': item.type === ItemType.Uuid }">
					<!-- Default informational element -->
					<VRow
						v-if="item.type === undefined || item.type === ItemType.InfoElement"
						variant="outlined"
						align="center"
						class="py-0"
					>
						<VCol v-if="items.some(itemElement => itemElement.icon)" cols="auto">
							<VIcon :icon="item.icon ?? 'fa-carrot'" :class="{ 'overlay-content-icon-dummy': !item.icon }" />
						</VCol>

						<VCol cols="auto">
							<VListItemTitle>
								{{ item.name }}
							</VListItemTitle>
						</VCol>

						<VSpacer />

						<VCol cols="auto">
							<VChip>
								{{ item.data }}
							</VChip>
						</VCol>
					</VRow>

					<!-- UUID element -->
					<div v-else-if="item.type === ItemType.Uuid">
						<VListItemTitle>
							{{ item.name }}
						</VListItemTitle>

						<highlightjs language="plaintext" :code="item.uuid" />
					</div>

					<!-- Tab element -->
					<!-- Key is bound to array, so that change of array triggers redraw of tabs, effectively displaying new window item, since the window item previously displayed might have been redrawn due to change of it's own contents -->
					<div v-else-if="item.type === ItemType.Tab" :key="item.tabs" :style="tabStyle(item)">
						<VListItemTitle class="text-center">List title</VListItemTitle>

						<VTabs
							:key="item.tabs"
							:model-value="getTab({ tabs: item.tabs })"
							@update:model-value="value => setTab({ tabs: item.tabs, value })"
						>
							<VTab v-for="(tab, tabKey) in item.tabs" :key="tabKey" :value="tabKey">{{ tab.name }}</VTab>
						</VTabs>

						<VWindow
							:model-value="getTab({ tabs: item.tabs })"
							@update:model-value="value => setTab({ tabs: item.tabs, value })"
						>
							<VWindowItem v-for="(tab, tabKey) in item.tabs" :key="tabKey" :value="tabKey">
								<OverlayContent :items="tab.items">
									<template v-for="slot in getSlots(tab)" #[slot]>
										<slot :name="slot" />
									</template>
								</OverlayContent>
							</VWindowItem>
						</VWindow>
					</div>

					<!-- Switch element -->
					<VRow v-if="item.type === ItemType.Switch" variant="outlined" class="py-0">
						<VCol cols="auto">
							<VListItemTitle>
								{{ item.name }}
							</VListItemTitle>
						</VCol>

						<VSpacer />

						<VCol cols="auto">
							<VSwitch
								:model-value="records[item.id]"
								@update:model-value="value => setRecord({ id: item.id, value })"
							/>
						</VCol>
					</VRow>

					<!-- Slot element -->
					<template v-if="item.type === ItemType.Slot">
						<VListItemTitle>
							{{ item.name }}
						</VListItemTitle>
						<slot :name="item.id" />
					</template>
				</VListItem>
				<template v-if="itemKey < items.length - 1">
					<VDivider />
				</template>
			</template>
		</VList>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import {
	VChip,
	VCol,
	VDivider,
	VIcon,
	VList,
	VListItem,
	VListItemTitle,
	VRow,
	VSpacer,
	VSwitch,
	VTab,
	VTabs,
	VWindow,
	VWindowItem
} from "vuetify/components";
import { ThisVueStore } from "../client/gui";
import { OverlayWindowItemType as ItemType } from "../common/front";
import { ElementSize, OverlayContentItem as Item, OverlayContentTabs as Tabs } from "./types";

/**
 * Element size pixels.
 */
type ElementSizePixels = {
	[Key in ElementSize]?: number;
};

export default defineComponent({
	components: {
		VChip,
		VCol,
		VDivider,
		VIcon,
		VList,
		VListItem,
		VListItemTitle,
		VRow,
		VSpacer,
		VSwitch,
		VTab,
		VTabs,
		VWindow,
		VWindowItem
	},

	computed: {
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
			ItemType,
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
				.filter(item => item.type === ItemType.Slot || item.type === ItemType.Tab)
				.forEach(item => {
					if (item.type === ItemType.Slot) {
						result.add(item.id);
						return;
					}

					// Filter guarantees narrowing
					(
						item as Item & {
							/**
							 * Tab type.
							 */
							type: ItemType.Tab;
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
			type: ItemType.Tab;
		}) {
			return {
				// Gets the size in pixels for the element size, or the default size in pixels
				height: `${this.sizes[size ?? this.defaultElementSize] ?? this.defaultElementSizePixels}px`
			};
		}
	},

	name: "OverlayContent",

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
		items: { required: true, type: Array as PropType<Array<Item>> }
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
