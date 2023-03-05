<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<div v-show="items.length > 0">
		<VList>
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<VListItem>
					<!-- Default informational element -->
					<VRow v-if="item.type === undefined || item.type === ItemType.InfoElement" variant="outlined">
						<VCol cols="auto" class="my-auto">
							<VListItemTitle>
								{{ item.name }}
							</VListItemTitle>
						</VCol>

						<VSpacer />

						<VCol cols="auto" class="my-auto">
							<VChip class="ma-2">
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
					<div
						v-else-if="item.type === ItemType.Tab"
						:key="item.tabs"
						:class="`overlay-container-content-tabs-size-${item.size ?? ElementSize}`"
					>
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
								<OverlayContainerContent :items="tab.items">
									<template v-for="slot in getSlots(tab)" #[slot]>
										<slot :name="slot" />
									</template>
								</OverlayContainerContent>
							</VWindowItem>
						</VWindow>
					</div>

					<!-- Switch element -->
					<VRow v-if="item.type === ItemType.Switch" variant="outlined">
						<VCol cols="auto" class="my-auto">
							<VListItemTitle>
								{{ item.name }}
							</VListItemTitle>
						</VCol>

						<VSpacer />

						<VCol cols="auto" class="my-auto">
							<VSwitch
								:model-value="records[item.id]"
								class="ma-2"
								@update:model-value="value => setRecord({ id: item.id, value })"
							/>
						</VCol>
					</VRow>

					<!-- Slot element -->
					<template v-if="item.type === ItemType.Slot">
						<VListItemTitle class="text-center">
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
import { OverlayContainerItemType as ItemType } from "../common/front";
import { ElementSize } from "./types";

/**
 * Tabs type.
 */
type Tabs = Array<{
	/**
	 * Name to display.
	 */
	name: string;

	/**
	 * Items to display.
	 */
	items: Array<Item>;
}>;

/**
 * Type for item props.
 */
type Item =
	// Informational object, default
	| {
			/**
			 * Informational list type.
			 */
			type?: ItemType.InfoElement;

			/**
			 * Badge value, if any.
			 */
			badge?: string | number;

			/**
			 * Name to display.
			 */
			name: string;

			/**
			 * Data to display.
			 */
			data: string | number;
	  }
	| {
			/**
			 * UUID type.
			 */
			type: ItemType.Uuid;

			/**
			 * UUID value.
			 */
			uuid: string;

			/**
			 * Name to display.
			 */
			name: string;
	  }
	| {
			/**
			 * Tab type.
			 */
			type: ItemType.Tab;

			/**
			 * Data to display.
			 */
			tabs: Tabs;

			/**
			 * Size of the tab.
			 */
			size?: ElementSize;
	  }
	| {
			/**
			 * Switch type.
			 */
			type: ItemType.Switch;

			/**
			 * Switch name.
			 */
			name: string;

			/**
			 * Event ID.
			 */
			id: string;
	  }
	| {
			/**
			 * Slot type.
			 */
			type: ItemType.Slot;

			/**
			 * Slot name.
			 */
			id: string;

			/**
			 * Slot name to display.
			 */
			name: string;
	  };

export default defineComponent({
	components: {
		VChip,
		VCol,
		VDivider,
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
		return {
			ItemType,
			defaultElementSize: ElementSize.Medium,
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
		}
	},

	name: "OverlayContainerContent",

	/**
	 * Props for component.
	 *
	 * @returns Component props
	 */
	props: {
		items: { required: true, type: Object as PropType<Array<Item>> }
	}
});
</script>

<style scoped>
.overlay-container-content-tabs-size-sm {
	height: 300px;
}

.overlay-container-content-tabs-size-md {
	height: 500px;
}

.overlay-container-content-tabs-size-lg {
	height: 700px;
}
</style>
