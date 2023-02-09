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
					<div v-else-if="item.type === ItemType.Tab" :key="item.tabs">
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
								<OverlayContainerContent :items="tab.items" />
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
		 *
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
			tab2: null,
			tabFallBack: null,
			tabs: new Map<Tabs, number | null>()
		};
	},

	methods: {
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
