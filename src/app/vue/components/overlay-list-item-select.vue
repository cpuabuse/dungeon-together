<!-- Select element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps" @ui-action="emitUiAction">
		<!-- Inline slot -->
		<template #content>
			<OverlayListBody v-if="isMenu" :content-type="contentType">
				<VList :density="isCompact ? 'compact' : 'default'" class="py-0">
					<VListItem
						v-for="({ name, value }, itemKey) in items"
						:key="itemKey"
						:value="value"
						:title="name"
						@click="model = value"
					/>
				</VList>
			</OverlayListBody>

			<!-- Solo filled flat is closest to default, while being good for standalone; Density seems not to be inherited. -->
			<VSelect
				v-else
				v-model="model"
				:items="items"
				item-title="name"
				item-value="value"
				variant="solo-filled"
				flat
				:density="isCompact ? 'compact' : 'default'"
				hide-details
			/>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VList, VListItem, VSelect } from "vuetify/components";
import {
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import OverlayListBody from "./overlay-list-body.vue";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListBody,
		OverlayListItemAssembler,
		VList,
		VListItem,
		VSelect
	},

	/**
	 * Computed.
	 */
	computed: {
		model: {
			/**
			 * Model getter.
			 *
			 * @returns Model value
			 */
			get(): string | undefined {
				const value: unknown = this.recordStore.records[this.id];
				if (typeof value === "string") {
					return value;
				}
				return undefined;
			},

			/**
			 * Model setter.
			 *
			 * @param value - Value to set to model
			 */
			set(value: string): void {
				this.recordStore.records[this.id] = value;
			}
		}
	},

	emits: overlayListSharedEmits,

	/**
	 * Props.
	 */
	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		id: {
			required: true,
			type: [String, Symbol]
		},

		items: {
			required: true,
			type: Array as PropType<Array<Record<"name" | "value", string>>>
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @param param - Context
	 * @returns Record operations and shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		const stores: Stores = useStores();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();

		return { recordStore, ...useOverlayListShared({ emit, props }), ...useOverlayListItemShared({ props }) };
	}
});
</script>

<style scoped lang="css">
/* Compact switch is too large */
.overlay-list-item-switch-compact {
	transform-origin: center right;
	scale: 0.75;
}

/* Non compact density should have smaller switch hover shadow not to be clipped, also for ripple */
:not(.overlay-list-item-switch-compact) :deep(.v-selection-control__input:hover::before),
:deep(.v-selection-control__input .v-ripple__container) {
	scale: 0.5;
}
</style>
