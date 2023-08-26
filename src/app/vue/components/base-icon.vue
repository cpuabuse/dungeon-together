<template>
	<div>
		<VIcon v-if="icon" :icon="icon" />
		<VAvatar v-else-if="base64ModeSrc" :src="base64ModeSrc" />
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
		 * Base64 mode source.
		 *
		 * @returns Base64 mode source, when mode icon is requested
		 */
		base64ModeSrc(): string {
			return this.mode.base64Src;
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

	props: {
		...iconProps,

		// Default is undefined
		// eslint-disable-next-line vue/require-default-prop
		modeUuid: {
			required: false,
			type: String
		}
	},

	data() {
		return {
			universe: (this as unknown as ThisVueStore).$store.state.universe
		};
	}
});
</script>
