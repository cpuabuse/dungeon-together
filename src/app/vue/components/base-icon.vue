<template>
	<div>
		<VIcon v-if="icon" :icon="icon" />
		<VAvatar v-else-if="base64ModeSrc" :image="base64ModeSrc" />
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VAvatar, VIcon } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import { ClientMode } from "../../client/mode";
import { iconProps } from "../core/icon";

export default defineComponent({
	components: {
		VAvatar,
		VIcon
	},

	computed: {
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
			base64ModeSrc: ClientMode.defaultBase64Src,
			universe: (this as unknown as ThisVueStore).$store.state.universe
		};
	},

	props: {
		...iconProps,

		// Default is undefined
		// eslint-disable-next-line vue/require-default-prop
		modeUuid: {
			required: false,
			type: String
		}
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
