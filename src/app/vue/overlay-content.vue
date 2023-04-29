<!--
	Content that goes into overlays, and it's sub-components.
	Accepts items prop JS object that is conditionally interpreted for rendering, determining what goes into which slot.

	Note - closes grandparent if parent non-menu is clicked(https://github.com/vuetifyjs/vuetify/issues/17004).
-->

<template>
	<VCard class="overflow-hidden w-100" :rounded="isMenu ? 'sm' : true">
		<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<!-- Force icon show if no name -->
				<OverlayContentItem
					:icon="item.icon"
					:name="item.name"
					:is-hidden-icon-displayed-if-missing="!!items.some(itemElement => itemElement.icon)"
					:content-type="contentType"
					:is-hidden-caret-displayed-if-missing="
						!!items.some(itemElement => itemElement.type === ItemType.Tab && itemElement.data)
					"
				>
					<!-- Inline slot -->
					<template v-if="[ItemType.InfoElement, undefined, ItemType.Switch].includes(item.type)" #inline>
						<!-- Info element -->
						<VChip v-if="item.type === ItemType.InfoElement || item.type === undefined">
							{{ item.data }}
						</VChip>

						<!-- Switch element -->
						<VSwitch
							v-if="item.type === ItemType.Switch"
							:model-value="records[item.id]"
							@update:model-value="value => setRecord({ id: item.id, value })"
						/>
					</template>

					<!-- Content slot --->
					<template v-if="[ItemType.Uuid, ItemType.Tab, ItemType.Slot].includes(item.type)" #content>
						<!-- Uuid element -->
						<highlightjs v-if="item.type === ItemType.Uuid" language="plaintext" :code="item.uuid" />

						<!-- Tab element -->
						<!-- Key is bound to array, so that change of array triggers redraw of tabs, effectively displaying new window item, since the window item previously displayed might have been redrawn due to change of it's own contents -->
						<template v-if="item.type === ItemType.Tab">
							<!-- Menu -->
							<template v-if="isMenu">
								<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
									<template v-for="(tab, tabKey) in item.tabs" :key="tabKey">
										<OverlayContentItem :name="tab.name" :content-type="contentType">
											<template #content>
												<OverlayContent :items="tab.items" :content-type="contentType">
													<template v-for="slot in getSlots(tab)" #[slot]>
														<slot :name="slot" />
													</template>
												</OverlayContent>
											</template>
										</OverlayContentItem>
									</template>
								</VList>
							</template>

							<!-- Block -->
							<template v-else>
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
										<OverlayContent :items="tab.items" :content-type="contentType">
											<template v-for="slot in getSlots(tab)" #[slot]>
												<slot :name="slot" />
											</template>
										</OverlayContent>
									</VWindowItem>
								</VWindow>
							</template>
						</template>

						<!-- Slot element -->
						<slot v-if="item.type === ItemType.Slot" :name="item.id" />
					</template>
				</OverlayContentItem>

				<template v-if="itemKey < items.length - 1">
					<VDivider />
				</template>
			</template>
		</VList>
	</VCard>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VCard, VChip, VDivider, VList, VSwitch, VTab, VTabs, VWindow, VWindowItem } from "vuetify/components";
import { ThisVueStore } from "../client/gui";
import { OverlayWindowItemType as ItemType } from "../common/front";
import OverlayContentItem from "./overlay-content-item.vue";
import { ElementSize, OverlayContentItem as Item, OverlayContentTabs as Tabs } from "./types";
import { OverlayContentType, overlayContentProps } from "./util";

/**
 * Element size pixels.
 */
type ElementSizePixels = {
	[Key in ElementSize]?: number;
};

export default defineComponent({
	components: {
		OverlayContentItem,
		VCard,
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
			return this.contentType === OverlayContentType.Menu;
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
		items: { required: true, type: Array as PropType<Array<Item>> },
		...overlayContentProps
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
