<!-- Info element -->
<template>
	<!-- Force icon show if no name -->
	<OverlayListItemAssembler v-bind="assemblerProps">
		<!-- Inline slot; Omit from display if no actions given -->
		<template v-if="uiActions.length > 0" #inline>
			<VBtnGroup v-if="uiActions.length > 0" :density="isCompact ? 'compact' : 'default'">
				<!-- Default button is very wide -->
				<VBtn
					v-for="(uiAction, uiActionKey) in uiActions"
					:key="uiActionKey"
					:size="isCompact ? 'x-small' : 'small'"
					@click="() => handleUiAction({ uiActionKey })"
				>
					<VTooltip :text="handleUiActionTooltip(uiAction)" location="bottom">
						<template #activator="{ props }">
							<div v-bind="props">
								<BaseIcon v-if="uiAction.icon || modeUuid" :mode-uuid="modeUuid" :icon="uiAction.icon" />
								<span v-else>{{ uiAction.uiActionWord }}</span>
							</div>
						</template>
					</VTooltip>
				</VBtn>
			</VBtnGroup>
		</template>
	</OverlayListItemAssembler>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VBtn, VBtnGroup, VTooltip } from "vuetify/components";
import { ActionWords } from "../../server/action";
import {
	OverlayContainerUiActionWords,
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

/**
 * Words to be displayed for UI actions, in the tooltip.
 */
const uiActionTooltipMain: Record<OverlayContainerUiActionWords, string> = {
	[OverlayContainerUiActionWords.EntityAction]: "Action",
	[OverlayContainerUiActionWords.EntityInfo]: "Info",
	[OverlayContainerUiActionWords.EntityDebugInfo]: "Debug Info",
	[OverlayContainerUiActionWords.CellDebugInfo]: "Cell Debug Info",
	[OverlayContainerUiActionWords.ForceMovement]: "Move"
};

/**
 * Words to be displayed for entity actions, in the tooltip.
 */
const uiActionTooltipEntityActionCtx: Record<ActionWords, string> = {
	[ActionWords.Attack]: "Attack",
	[ActionWords.Interact]: "Interact",
	[ActionWords.Drop]: "Drop",
	[ActionWords.Pickup]: "Pickup",
	[ActionWords.Talk]: "Talk",
	[ActionWords.Use]: "Use"
};

export default defineComponent({
	components: {
		BaseIcon,
		OverlayListItemAssembler,
		VBtn,
		VBtnGroup,
		VTooltip
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
		},

		/**
		 * Handle tooltip for UI action.
		 *
		 * @param param - UI action parameter
		 * @returns Tooltip text
		 */
		handleUiActionTooltip(param: OverlayContentUiActionParam): string {
			// Tooltipmain of type string, set tooltipmain based on uiActionWord, extract from uiActionTooltipMain
			const tooltipMain: string = uiActionTooltipMain[param.uiActionWord];

			const tooltipCtx: string | null =
				param.uiActionWord === OverlayContainerUiActionWords.EntityAction
					? uiActionTooltipEntityActionCtx[param.entityActionWord] ?? undefined
					: null;

			return tooltipCtx ? `${tooltipMain} - ${tooltipCtx}` : `${tooltipMain}`;
		}
	},

	props: {
		...overlayListSharedProps,
		...overlayListChildSharedProps,
		...overlayListItemNarrowProps,

		uiActions: {
			default: new Array<OverlayContentUiActionParam>(),
			required: true,
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
