<!-- Info element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps">
		<!-- Inline slot; Omit from display if no actions given -->
		<template v-if="uiActions.length > 0" #inline>
			<VBtnGroup v-if="uiActions.length > 0" :density="isCompact ? 'compact' : 'default'">
				<!-- Default button is very wide -->
				<VBtn
					v-for="({ icon: uiActionIcon, modeUuid, uiActionWord }, uiActionKey) in uiActions"
					:key="uiActionKey"
					:size="isCompact ? 'x-small' : 'small'"
					@click="() => handleUiAction({ uiActionKey })"
				>
					<BaseIcon v-if="uiActionIcon || modeUuid" :mode-uuid="modeUuid" :icon="uiActionIcon" />
					<span v-else>{{ uiActionWord }}</span>
				</VBtn>
			</VBtnGroup>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VBtn, VBtnGroup } from "vuetify/components";
import {
	OverlayContentUiActionParam,
	overlayListChildSharedProps,
	overlayListItemNarrowProps,
	overlayListSharedEmits,
	overlayListSharedProps,
	useOverlayListItemShared,
	useOverlayListShared
} from "../core/overlay";
import BaseIcon from "./base-icon.vue";
import OverlayListItemAssembler from "./overlay-list-item-assembler.vue";

export default defineComponent({
	components: {
		BaseIcon,
		OverlayListItemAssembler,
		VBtn,
		VBtnGroup
	},

	emits: overlayListSharedEmits,

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
			// This function is called from a for loop inside of a template, so the value with that key exists
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.emitUiAction(this.uiActions[uiActionKey]!);
		}
	},

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

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
	 * @param param - Context
	 * @returns Shared props
	 */
	// Infer setup
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		return { ...useOverlayListShared({ emit, props }), ...useOverlayListItemShared({ props }) };
	}
});
</script>
