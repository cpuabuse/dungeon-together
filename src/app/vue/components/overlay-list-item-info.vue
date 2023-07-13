<!-- Info element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler
		:icon="icon"
		:name="name"
		:is-hidden-icon-displayed-if-missing="isHiddenIconDisplayedIfMissing"
		:content-type="contentType"
		:is-hidden-caret-displayed-if-missing="isHiddenCaretDisplayedIfMissing"
	>
		<!-- Inline slot; Omit from display if no data given -->
		<template v-if="data || uiActions.length > 0" #inline>
			<!-- Density from list is not passed through into chip -->
			<VChip v-if="data" :density="isCompact ? 'compact' : 'default'">
				{{ data }}
			</VChip>

			<div v-if="uiActions.length > 0">
				<VBtn
					v-for="(uiAction, uiActionKey) in uiActions"
					:key="uiActionKey"
					@click="() => handleUiAction({ uiActionKey })"
					>ok</VBtn
				>
			</div>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VBtn, VChip } from "vuetify/components";
import {
	OverlayContentUiActionParam,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedProps,
	useOverlayListShared
} from "../core/overlay";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		OverlayListItemAssembler,
		VBtn,
		VChip
	},

	emits: ["uiAction"],

	methods: {
		/**
		 * Dispatch an event with a payload of the UI action.
		 *
		 * @param uiAction - UI action key
		 */
		handleUiAction({
			uiActionKey
		}: {
			/**
			 * UI action key.
			 */
			uiActionKey: number;
		}) {
			this.$emit("uiAction", this.uiActions[uiActionKey]);
		}
	},

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,
		// Will be omitted from display
		// eslint-disable-next-line vue/require-default-prop
		data: {
			required: false,
			type: [String, Number]
		},

		uiActions: {
			default: new Array<OverlayContentUiActionParam>(),
			required: false,
			type: Array as PropType<Array<OverlayContentUiActionParam>>
		}
	},

	/**
	 * Setup hook.
	 *
	 * @param props - Props
	 * @returns Shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props) {
		return useOverlayListShared({ props });
	}
});
</script>
