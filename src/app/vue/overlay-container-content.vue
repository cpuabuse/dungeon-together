<!--
	Content that goes into overlay-container, and it's sub-components.
	Accepts props JS object that is conditionally interpreted for rendering. 
-->

<template>
	<VList v-show="items.length > 0">
		<template v-for="(item, itemKey) in items" :key="itemKey">
			<!-- `v-for` used in `li` so that if conditions fail, the `li` is not rendered -->
			<VListItem v-if="item.type === undefined || item.type === ItemType.InfoElement">
				{{ item.name }}
			</VListItem>
			<VListItem v-else-if="item.type === ItemType.Uuid">
				{{ item.name }}
				{{ item.uuid }}
			</VListItem>
		</template>
	</VList>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VList, VListItem } from "vuetify/components";
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
	components: { VList, VListItem },
	/**
	 * Data for component.
	 *
	 * @returns Component data
	 */
	data() {
		return {
			ItemType
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
