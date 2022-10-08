<!-- Game control menu -->

<template>
	<!-- To transition, when menu content is changed -->
	<VToolbar :key="uniqueKey">
		<VToolbarItems>
			<VBtn icon :stacked="hasLabels" @click="toggleExtended()">
				<VIcon icon="bars" />
				<span v-show="hasLabels">{{ name }}</span>
			</VBtn>
		</VToolbarItems>

		<VExpandXTransition v-for="(itemGroup, itemGroupKey) in itemGroups" :key="itemGroupKey">
			<VToolbarItems v-show="itemGroup.isPinned || isExtended">
				<VBtn
					v-for="(item, itemKey) in itemGroup.items"
					:key="itemKey"
					icon
					:stacked="hasLabels"
					@click="itemClick(item)"
				>
					<VIcon icon="home" />
					<span v-show="hasLabels">{{ item.name }}</span>
				</VBtn>
			</VToolbarItems>
		</VExpandXTransition>
	</VToolbar>
</template>

<script lang="ts">
import { PropType, defineComponent, nextTick } from "vue";
import { VBtn, VExpandXTransition, VIcon, VToolbar, VToolbarItems } from "vuetify/components";

/**
 * Compact toolbar menu item(button).
 */
export type CompactToolbarMenuItem = {
	/**
	 * Name of the item.
	 */
	name: string;
};

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
		VToolbarItems
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
		 * Unique key account for all data, presentable to user.
		 *
		 * @returns Unique key
		 */
		uniqueKey(): string {
			return `${this.name}${this.items.map(item => item.name).join()}`;
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
			// Modification of this property should make sure that values which are items indices are not out of bounds, and are unique
			pinnedIds: [] as Array<number>,
			usedQueue: [] as Array<number>
		};
	},

	methods: {
		/**
		 * Process item click.
		 *
		 * @param id - Item id
		 */
		itemClick({
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

			// Wait for the next tick to update the groups
			await nextTick();
			this.isExtended = !this.isExtended;
		}
	},

	props: {
		/**
		 * Menu name.
		 */
		hasLabels: { default: true, type: Boolean },

		/**
		 * Menu items.
		 */
		items: { required: true, type: Array as PropType<Array<CompactToolbarMenuItem>> },

		/**
		 * Maximum pinned amount of items, when collapsed.
		 */
		maxPinnedAmount: { default: 1, type: Number },

		/**
		 * Menu name.
		 */
		name: { required: true, type: String }
	},

	watch: {
		uniqueKey: {
			/**
			 * Handler for props change.
			 */
			handler() {
				this.resetQueues();
			}
		}
	}
});
</script>
