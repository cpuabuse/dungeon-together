<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<div v-show="items.length > 0" class="mx-4">
		<div>
			<template v-for="(item, itemKey) in items" :key="itemKey">
				<!-- `v-for` used in `li` so that if conditions fail, the `li` is not rendered -->

				<VCard v-if="item.type === undefined || item.type === ItemType.InfoElement" class="my-4">
					<VRow variant="outlined">
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
				</VCard>

				<VCard v-else-if="item.type === ItemType.Uuid" class="my-4">
					<VTabs v-model="tab">
						<VTab value="one">Map</VTab>
						<VTab value="two">UUID</VTab>
					</VTabs>

					<VWindow v-model="tab">
						<VWindowItem value="one">
							<VCard>
								<VCardText>MAP TEXT</VCardText>
							</VCard>
						</VWindowItem>

						<VWindowItem value="two">
							<VCard>
								<VCardText>TWO TEXT</VCardText>
							</VCard>
						</VWindowItem>
					</VWindow>
				</VCard>
			</template>
		</div>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import {
	VCard,
	VCardText,
	VChip,
	VCol,
	VContainer,
	VDivider,
	VList,
	VListItem,
	VRow,
	VSpacer,
	VTab,
	VTabs,
	VWindow,
	VWindowItem
} from "vuetify/components";
import { OverlayContainerItemType as ItemType } from "../common/front";

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
	  };

export default defineComponent({
	components: {
		VCard,
		VCardText,
		VChip,
		VCol,
		VContainer,
		VDivider,
		VList,
		VListItem,
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
			tab: null
		};
	},

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
