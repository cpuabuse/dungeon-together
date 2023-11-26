<template>
	<VApp full-height class="the-universe-app">
		<div class="app-content">
			<div class="time">Hello: {{ what }}</div>
			<tsxtest />
			<statealertbox v-show="alert" />
			<UniverseUi />
		</div>
	</VApp>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VApp } from "vuetify/components";
import { ThisVueStore } from "../../client/gui";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import stateAlertBoxComponent from "../state-alert-box.vue";
import tsxTestComponent from "../tsx/test.vue";
import UniverseUi from "../views/universe-ui.vue";

/**
 * Milliseconds in one second.
 */
const oneSecondInMs: number = 1000;

/**
 * Root component.
 */
export default defineComponent({
	components: {
		UniverseUi,
		VApp,
		statealertbox: stateAlertBoxComponent,
		tsxtest: tsxTestComponent
	},

	/**
	 * Computed props.
	 */
	computed: {
		/**
		 * To display alert or not.
		 *
		 * @returns Alert state
		 */
		alert(): boolean {
			// TODO: Add to Pinia store
			// Casting to boolean from temporary `any`
			return (this as unknown as ThisVueStore).$store.state.records.alert as boolean;
		}
	},

	/**
	 * Update timer every second.
	 */
	created() {
		setInterval(() => {
			this.$data.what = this.universe.application.state.upTime;
		}, oneSecondInMs);
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			what: 0
		};

		return data;
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
	}
});
</script>

<style lang="css" scoped>
.the-universe-app {
	background: none;

	/* To pass clicks to Pixi */
	pointer-events: none;
}
.app-content {
	position: absolute;
	top: 0;
	display: flex;
	flex-direction: column-reverse;
	width: 100%;
	height: 100%;
}

.time {
	color: red;
}
</style>
./core ./core/compact-toolbar
