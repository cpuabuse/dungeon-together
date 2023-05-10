<!-- Switch element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Inline slot -->
		<template #inline>
			<VSwitch
				:model-value="records[id]"
				@update:model-value="
					value => {
						if (typeof value == 'boolean') {
							setRecord({ id: id, value });
						}
					}
				"
			/>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VSwitch } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import { overlayListChildSharedProps, overlayListItemNarrowProps, overlayListSharedProps } from "../core/overlay";
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

	methods: {
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
	},

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		id: {
			required: true,
			type: String
		}
	}
});
</script>
