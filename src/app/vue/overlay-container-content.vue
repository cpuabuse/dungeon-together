<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<VList v-show="items.length > 0">
		<template v-for="(item, itemKey) in items" :key="itemKey">
			<!-- `v-for` used in `li` so that if conditions fail, the `li` is not rendered -->
			<VListItem v-if="item.type === undefined || item.type === ItemType.InfoElement">
				<VRow class="align-items-center">
					<VCol>
						{{ item.name }}
					</VCol>

					<VSpacer></VSpacer>

					<VCol>
						<VChip class="ma-2" text-color="white">
							<VAvatar>{{ item.data }}</VAvatar>
						</VChip>
					</VCol>
				</VRow>
			</VListItem>

			<VListItem v-else-if="item.type === ItemType.Uuid">
				<VCard>
					<VTabs v-model="tab" bg-color="primary">
						<VTab value="one">Map</VTab>
						<VTab value="two">UUID</VTab>
					</VTabs>

					<VCardText>
						<VWindow v-model="tab">
							<VWindowItem value="one">MAP</VWindowItem>

							<VWindowItem value="two"> Player </VWindowItem>
						</VWindow>
					</VCardText>
				</VCard>
			</VListItem>
		</template>
	</VList>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import {
	VAvatar,
	VCard,
	VCardText,
	VChip,
	VCol,
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
		VAvatar,
		VCard,
		VCardText,
		VChip,
		VCol,
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
