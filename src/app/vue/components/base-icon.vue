<template>
	<!-- Flex needed for identical alignment within flex containers -->
	<div class="base-icon d-flex">
		<VIcon :icon="icon ?? (base64ModeSrc ? undefined : 'fa-carrot')" :size="iconSize">
			<!--
				Wrap image into icon to duplicate size.
				Image will keep aspect ratio and fit the icon.
				Icon itself does not have fixed aspect ratio, but the container does, so both will be the same positionally.
			-->
			<VImg v-if="base64ModeSrc" :src="base64ModeSrc" />
		</VIcon>
	</div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { VIcon, VImg } from "vuetify/components";
import { ClientMode } from "../../client/mode";
import { ElementSize } from "../common/element";
import { iconProps } from "../core/icon";
import { Store, StoreWord, Stores, useStores } from "../core/store";

export default defineComponent({
	components: {
		VIcon,
		VImg
	},

	computed: {
		/**
		 * Converts to size for Vuetify.
		 *
		 * @returns Vuetify size string
		 */
		iconSize(): string | undefined {
			switch (this.size) {
				case ElementSize.Small:
					return "small";
				case ElementSize.Large:
					return "large";
				default:
					return undefined;
			}
		},

		/**
		 * Mode.
		 *
		 * @returns Mode, when mode icon is requested
		 */
		mode(): ClientMode {
			return (
				(this.modeUuid ? this.universe.modes.get(this.modeUuid) : undefined) ??
				// Casting because of Vue class type erasure
				(this.universe.defaultMode as ClientMode)
			);
		}
	},

	/**
	 * Data.
	 *
	 * @returns Data
	 */
	data() {
		return {
			// Base64 mode source
			base64ModeSrc: ClientMode.defaultBase64Src
		};
	},

	props: {
		...iconProps,

		// Default is undefined
		// eslint-disable-next-line vue/require-default-prop
		modeUuid: {
			required: false,
			type: String
		},

		size: {
			default: ElementSize.Medium,
			requried: false,
			type: String as PropType<ElementSize>
		}
	},

	/**
	 * Setup hook.
	 *
	 * @returns Universe store
	 */
	setup() {
		const stores: Stores = useStores();
		const { universe }: Store<StoreWord.Universe> = stores.useUniverseStore();

		return {
			universe
		};
	},

	watch: {
		mode: {
			/**
			 * Watches for mode changes.
			 *
			 * @param mode - Mode for display
			 */
			handler(mode: ClientMode): void {
				// Only update when mode UUID is given
				if (this.modeUuid) {
					// Update image with inital value
					this.base64ModeSrc = mode.base64Src;
					mode.isInitialized.finally(() => {
						// Update with promise value
						this.base64ModeSrc = mode.base64Src;
					});
				}
			},
			immediate: true
		}
	}
});
</script>

<style scoped>
/* Override reduction in size of VIcon inside the VBtn, as sizing is tied to mode  */
.v-btn .base-icon {
	font-size: 1rem;
}
.v-btn .v-icon {
	--v-icon-size-multiplier: 1;
}
</style>
