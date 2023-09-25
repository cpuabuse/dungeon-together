<!-- Game control menu -->

<template>
	<!-- `compact` makes collapse menus without pinned items equal sides, when not stacked (`default` when stacked); Makes extra large icons fit well in both cases -->
	<VToolbar
		:density="hasLabels ? 'default' : 'compact'"
		:rounded="true"
		class="w-auto"
		:class="{ 'compact-toolbar-menu-has-labels': hasLabels, 'compact-toolbar-menu': true }"
	>
		<!-- `tonal` for toggler to stand out -->
		<VToolbarItems variant="tonal">
			<VTooltip :text="tooltipText" :open-delay="openDelay" :location="tooltipLocation">
				<template #activator="{ props }">
					<div v-bind="props" class="compact-toolbar-tooltip-content-wrapper">
						<!-- Since button is not child of toolbar anymore, remove rounded corners -->
						<VBtn
							:rounded="0"
							class="px-1"
							:stacked="hasLabels"
							:color="isHighlightedOnOpen && isExtended ? 'primary' : 'default'"
							:disabled="items.length < 1 || (!isExtended && items.length <= maxPinnedAmount)"
							@click="toggleExtended"
						>
							<VIcon size="x-large" :icon="icon" />

							<!-- Menu indicator also scales to match icon relative size -->
							<span v-show="hasLabels" class="text-truncate button-text">{{ name }}</span>
							<span v-show="hasLabels" v-if="nameSubtext" class="text-truncate button-text">{{ nameSubtext }}</span>
						</VBtn>
					</div>
				</template>
			</VTooltip>
		</VToolbarItems>

		<VExpandXTransition v-for="(itemGroup, itemGroupKey) in itemGroups" :key="itemGroupKey">
			<VToolbarItems v-show="itemGroup.isPinned || isExtended">
				<template v-for="(item, itemKey) in itemGroup.items" :key="itemKey">
					<VTooltip :text="item.tooltip" :open-delay="openDelay" :location="tooltipLocation">
						<template #activator="{ props }">
							<div v-bind="props" class="compact-toolbar-tooltip-content-wrapper">
								<!-- Since button is not child of toolbar anymore, remove rounded corners -->
								<VBtn
									:disabled="!(item.mode === 'click' || item.clickRecordIndex)"
									:stacked="hasLabels"
									class="compact-toolbar-menu-item px-1"
									@click="() => clickItem(item)"
								>
									<VIcon :icon="item.icon ?? 'fa-carrot'" size="x-large" />

									<!-- Labels -->
									<span
										v-for="(itemEntry, itemTextIndex) in item.labelEntries"
										:key="itemTextIndex"
										class="text-truncate button-text"
										:class="itemEntry.class"
									>
										{{ itemEntry.text }}
									</span>
								</VBtn>
							</div>
						</template>
					</VTooltip>
				</template>
			</VToolbarItems>
		</VExpandXTransition>
	</VToolbar>
</template>

<script lang="ts">
import { defineComponent, nextTick } from "vue";
import { VBtn, VExpandXTransition, VIcon, VToolbar, VToolbarItems, VTooltip } from "vuetify/components";
import { defaultDelayMs } from "./common/animation";
import {
	CompactToolbarMenuItem,
	compactToolbarMenuBaseProps,
	compactToolbarSharedMenuProps
} from "./core/compact-toolbar";
import { useLocale } from "./core/locale";
import { useRecords } from "./core/store";

/**
 * Item with meta.
 */
type IndexedItem = CompactToolbarMenuItem &
	Record<"id", number> &
	Record<"tooltip", string> & {
		/**
		 * Text entries for under the button.
		 */
		labelEntries: Array<{
			/**
			 * Text to show under button.
			 */
			text: string;

			/**
			 * Classes to attach to each text element.
			 */
			class: Array<string>;
		}>;
	};

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
		 * Button text computed.
		 *
		 * @returns - Button text data
		 */
		buttonText(): Record<"fontSize" | "width", string> {
			return this.hasNoCapitalization
				? {
						fontSize: "1em",
						width: "5em"
				  }
				: this.reducedButtonText;
		},

		/**
		 * Items with index.
		 *
		 * @returns Array of items with index
		 */
		indexedItems(): Array<IndexedItem> {
			return this.items.map((item, itemIndex) => {
				const labelEntries: IndexedItem["labelEntries"] = this.hasLabels
					? [item.name, item.nameSubtext]
							.filter<string>((text: string | undefined): text is string => {
								return Boolean(text && text.length > 0);
							})
							.map((text, textIndex, textArray) => {
								return {
									class:
										textIndex + 1 === textArray.length
											? [
													// Only produced when active
													...(this.getBooleanRecord({ id: item.clickRecordIndex })
														? ["text-decoration-underline"]
														: []),

													// Always produced
													"compact-toolbar-menu-unerline"
											  ]
											: [],
									text
								};
							})
					: [];

				return {
					...item,
					id: itemIndex,
					labelEntries,
					tooltip: labelEntries.map(entry => entry.text).join(" - ")
				};
			});
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
		 * Button text reduced size.
		 *
		 * @returns - Button text data
		 */
		reducedButtonText(): Record<"fontSize" | "width", string> {
			return {
				fontSize: "0.6em",
				width: "6.5em"
			};
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
			this.toggleBooleanRecord({ id: clickRecordIndex });

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
		return { ...useRecords(), ...useLocale() };
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
	font-size: v-bind("buttonText.fontSize");

	width: v-bind("buttonText.width");
}

/* Always reduce font size for subtext */
.button-text + .button-text {
	font-size: v-bind("reducedButtonText.fontSize");

	width: v-bind("reducedButtonText.width");
}

.compact-toolbar-menu-unerline {
	/* Reserve space for potentially active text */
	padding-bottom: calc(0.125rem - 1px);
}
.compact-toolbar-menu-has-labels .compact-toolbar-menu-item {
	/* Reserve space for potentially active text in parent element, only can happen if labels are there */
	padding-top: calc(0.125rem - 1px);
}

/* Override vuetify, only for active labels; Set to root units, as size changes for subtext */
.text-decoration-underline.compact-toolbar-menu-unerline {
	text-decoration-color: rgb(var(--v-theme-primary)) !important;
	text-decoration-thickness: 0.125rem !important;
}

/* Stretch wrapper to fit content as if wrapper didn't exist; Unlike `contents` positional information for tooltip popup is preserved */
.compact-toolbar-tooltip-content-wrapper {
	display: grid;
}

.compact-toolbar-menu {
	pointer-events: auto;
}
</style>
