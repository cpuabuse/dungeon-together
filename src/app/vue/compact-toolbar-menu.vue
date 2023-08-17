<!-- Game control menu -->

<template>
	<!-- `compact` makes collapse menus without pinned items equal sides, when not stacked (`default` when stacked); Makes extra large icons fit well in both cases -->
	<VToolbar :density="hasLabels ? 'default' : 'compact'" rounded="xl" class="w-auto">
		<!-- `tonal` for toggler to stand out -->
		<VToolbarItems variant="tonal">
			<VTooltip :text="tooltipText" :open-delay="openDelay" :location="tooltipLocation">
				<template #activator="{ props }">
					<VBtn
						:stacked="hasLabels"
						:color="isHighlightedOnOpen && isExtended ? 'primary' : 'default'"
						v-bind="props"
						:disabled="itemGroups.length < 1"
						@click="toggleExtended"
					>
						<VIcon size="x-large" :icon="icon" />
						<!-- Menu indicator also scales to match icon relative size -->
						<span v-show="hasLabels" class="text-truncate button-text">{{ name }}</span>
						<span v-show="hasLabels" v-if="nameSubtext" class="text-truncate button-text">{{ nameSubtext }}</span>
					</VBtn>
				</template>
			</VTooltip>
		</VToolbarItems>

		<VExpandXTransition v-for="(itemGroup, itemGroupKey) in itemGroups" :key="itemGroupKey">
			<VToolbarItems v-show="itemGroup.isPinned || isExtended">
				<template v-for="(item, itemKey) in itemGroup.items" :key="itemKey">
					<VBtn
						v-if="item.mode === 'click' || item.clickRecordIndex"
						:stacked="hasLabels"
						@click="() => clickItem(item)"
					>
						<VIcon :icon="item.icon ?? 'fa-carrot'" size="x-large" />
						<span v-show="hasLabels" class="text-truncate button-text">{{ item.name }}</span>
						<span v-show="hasLabels" v-if="item.nameSubtext" class="text-truncate button-text">{{
							item.nameSubtext
						}}</span>
					</VBtn>
					<VBtn v-else disabled :stacked="hasLabels">
						<VIcon :icon="item.icon ?? 'fa-carrot'" size="x-large" />
						<span v-show="hasLabels" class="text-truncate button-text">{{ item.name }}</span>
						<span v-show="hasLabels" v-if="item.nameSubtext" class="text-truncate button-text">{{
							item.nameSubtext
						}}</span>
					</VBtn>
				</template>
			</VToolbarItems>
		</VExpandXTransition>
	</VToolbar>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { VBtn, VExpandXTransition, VIcon, VToolbar, VToolbarItems, VTooltip } from "vuetify/components";
import { ThisVueStore, UniverseStore } from "../client/gui";
import { defaultDelayMs } from "./common/animation";
import {
	CompactToolbarMenuItem,
	compactToolbarMenuBaseProps,
	compactToolbarSharedMenuProps
} from "./core/compact-toolbar";
import { useRecords } from "./core/store";

/**
 * Item with meta.
 */
type IndexedItem = CompactToolbarMenuItem & Record<"id", number>;

/**
 * Item(button) group to show/hide together.
 */
type ItemGroup = {
	/**
	 * Items.
	 */
	items: Array<IndexedItem>;

	/**
	 * Is collapsed or not.
	 */
	isPinned: boolean;
};

/**
 * Root component.
 */
export default defineComponent({
	/**
	 * Components.
	 */
	components: {
		VBtn,
		VExpandXTransition,
		VIcon,
		VToolbar,
		VToolbarItems,
		VTooltip
	},

	/**
	 * Computed for component.
	 *
	 * @returns - Computed object
	 */
	computed: {
		/**
		 * Items with index.
		 *
		 * @returns Array of items with index
		 */
		indexedItems(): Array<IndexedItem> {
			return this.items.map((item, index) => ({ ...item, id: index }));
		},

		/**
		 * Array of arrays of items.
		 *
		 * @returns - Array of arrays of items
		 */
		itemGroups(): Array<ItemGroup> {
			return this.indexedItems.reduce((result, value, index) => {
				let isPinned: boolean = this.pinnedIds.includes(index);
				let lastItemGroup: ItemGroup | undefined = result.pop();
				let currentItemGroup: ItemGroup | undefined;

				// Try to reuse last item
				if (lastItemGroup) {
					if (lastItemGroup.isPinned === isPinned) {
						currentItemGroup = lastItemGroup;
					} else {
						result.push(lastItemGroup);
					}
				}

				// Set to new if cannot reuse
				if (!currentItemGroup) {
					currentItemGroup = {
						isPinned,
						items: []
					};
				}

				// Add item
				currentItemGroup.items.push(value);

				// Finally, push to result
				result.push(currentItemGroup);

				return result;
			}, [] as Array<ItemGroup>);
		},

		/**
		 * Text for a menu button tooltip.
		 *
		 * @returns Tooltip string
		 */
		tooltipText(): string {
			return `${this.name}${this.nameSubtext ? ` - ${this.nameSubtext}` : ""}`;
		}
	},

	/**
	 * On created.
	 */
	created() {
		this.resetQueues();
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		return {
			isExtended: false,

			openDelay: defaultDelayMs,
			// Modification of this property should make sure that values which are items indices are not out of bounds, and are unique
			pinnedIds: [] as Array<number>,

			// Location for tooltip depends on location of menu and direction
			tooltipLocation: "top" as const,

			usedQueue: [] as Array<number>
		};
	},

	emits: ["extend", "click"],

	methods: {
		/**
		 * Process item clicked.
		 *
		 * @param param - Destructured parameter
		 */
		clickItem({ id, clickRecordIndex }: IndexedItem) {
			const store: UniverseStore = (this as unknown as ThisVueStore).$store;
			let value: boolean = true;
			if (clickRecordIndex) {
				const record: unknown = store.state.records[clickRecordIndex];
				if (typeof record === "boolean") {
					value = !record;
				}

				this.setRecord({
					id: clickRecordIndex,
					value
				});
			}

			this.useItem({ id });
			this.$emit("click", { itemId: id });
		},

		/**
		 * Initialize queues.
		 */
		resetQueues() {
			this.usedQueue = Array.from(new Array(this.maxPinnedAmount), (entry, index) => {
				return index;
			});
			this.pinnedIds = [...this.usedQueue];
		},

		/**
		 * Extends or collapses menu.
		 */
		async toggleExtended() {
			// Update the groups only when collapsing
			if (this.isExtended) {
				this.pinnedIds = [...this.usedQueue];
			}

			// Wait for the next tick to update the groups, otherwise some items in groups would disappear immediately
			await nextTick();

			this.isExtended = !this.isExtended;
			if (this.isExtended) {
				this.$emit("extend");
			}
		},

		/**
		 * Process item used.
		 *
		 * @param id - Item id
		 */
		useItem({
			id
		}: {
			/**
			 * Item ID.
			 */
			id: number;
		}) {
			if (this.usedQueue.includes(id)) {
				// Rearrange queue
				this.usedQueue = [...this.usedQueue.filter(element => element !== id), id];
			} else {
				// Add to queue, remove last to preserve count, if 0
				this.usedQueue.push(id);
				this.usedQueue.shift();
			}
		}
	},

	props: {
		...compactToolbarMenuBaseProps,

		...compactToolbarSharedMenuProps,

		/**
		 * Menu name.
		 */
		isForceCollapsed: { default: false, type: Boolean }
	},

	/**
	 * Setup hook.
	 *
	 * @returns Record operations and shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup() {
		return useRecords();
	},

	watch: {
		isForceCollapsed: {
			/**
			 * Makes sure that when another menu is open, this is collapsed, if necessary.
			 */
			async handler() {
				if (this.isForceCollapsed && this.isExtended) {
					await this.toggleExtended();
				}
			}
		}
	}
});
</script>

<style scoped>
.button-text {
	/* Smaller font size for menu, as it is more of a tooltip */
	font-size: 0.6em;

	/* Max width will be based on font size; Simplest and most robust way to make same length buttons */
	width: 6em;
}
</style>
./core ./core/compact-toolbar
