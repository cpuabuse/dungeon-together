<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<div v-show="items.length > 0" class="mx-4">
		<div>
			<VCard v-for="(item, itemKey) in items" :key="itemKey" class="my-4">
				<!-- Default informational element -->
				<VRow v-if="item.type === undefined || item.type === ItemType.InfoElement" variant="outlined">
					<VCol cols="auto" class="my-auto">
						<VCardText>{{ item.name }}</VCardText>
					</VCol>

					<VSpacer />

					<VCol cols="auto" class="my-auto">
						<VChip class="ma-2">
							{{ item.data }}
						</VChip>
					</VCol>
				</VRow>

				<!-- Tab element -->
				<!-- Key is bound to array, so that change of array triggers redraw of tabs, effectively displaying new window item, since the window item previously displayed might have been redrawn due to change of it's own contents -->
				<div v-else-if="item.type === ItemType.Tab" :key="item.tabs">
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
			</VCard>
		</div>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VCard, VCardText, VChip, VCol, VRow, VSpacer, VTab, VTabs, VWindow, VWindowItem } from "vuetify/components";
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
	  };

export default defineComponent({
	components: {
		VCard,
		VCardText,
		VChip,
		VCol,
		VRow,
		VSpacer,
		VTab,
		VTabs,
		VWindow,
		VWindowItem
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
