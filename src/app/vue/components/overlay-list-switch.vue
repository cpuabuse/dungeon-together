<!-- Switch element -->
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
		<template #inline>
			<VSwitch
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
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VSwitch } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import {
	OverlayListItemEntryExtract,
	OverlayListItemEntryType,
	overlayListChildSharedProps,
	overlayListSharedProps
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		VSwitch
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

	props: {
		item: {
			required: true,
			type: Object as PropType<OverlayListItemEntryExtract<OverlayListItemEntryType.Switch>>
		},
		...overlayListSharedProps,
		...overlayListChildSharedProps
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
	}
});
</script>
