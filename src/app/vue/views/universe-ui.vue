<!-- Universe UI -->
<template>
	<VLocaleProvider :rtl="isRtl">
		<!-- Vuetify unconditionally displays bar at the top of the screen -->
		<UniverseUiInfoBar :shard-entries="(shardEntries as UniverseUiShardEntries)" />

		<UniverseUiClick :rc-menu-data="rcMenuData" />

		<!-- Undefined assertion since index used in iteration -->
		<UniverseUiShard
			v-for="[shardUuid, shardEntry] in shardEntries"
			:key="shardUuid"
			v-model="shardEntry.model"
			:shard="shardEntry.shard"
			@update-menu="shardEntry.menuEntry.onUpdateMenu"
		/>

		<UniverseUiToolbar :shard-entries="(shardEntries as UniverseUiShardEntries)" :shard-menus="shardMenus" />
	</VLocaleProvider>
</template>

<script lang="ts">
import { ComputedRef, Ref, ShallowRef, computed, defineComponent, shallowRef } from "vue";
import { VLocaleProvider } from "vuetify/components";
import { useStore } from "vuex";
import { ClientUniverseStateRcMenuData, ThisVueStore, UniverseState, UniverseStore } from "../../client/gui";
import { CompactToolbarMenu, useCompactToolbarMenuConsumer } from "../core/compact-toolbar";
import { TextDirectionWords, textDirectionSymbol } from "../core/locale";
import { Stores, useStores } from "../core/store";
import { UniverseUiShardEntries } from "../core/universe-ui";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiInfoBar from "./universe-ui-info-bar.vue";
import UniverseUiShard from "./universe-ui-shard.vue";
import UniverseUiToolbar from "./universe-ui-toolbar.vue";

export default defineComponent({
	components: { UniverseUiClick, UniverseUiInfoBar, UniverseUiShard, UniverseUiToolbar, VLocaleProvider },

	computed: {
		/**
		 * Right click menu data.
		 *
		 * @returns Right click menu data or `null` when to display nothing
		 */
		rcMenuData(): ClientUniverseStateRcMenuData {
			// Casting since class type information lost
			return (this.state as unknown as UniverseState).rcMenuData;
		}
	},

	/**
	 * Created callback.
	 */
	created() {
		// Init entries
		this.updateShardEntries();

		// Update entries
		this.unsubscribe = (this as unknown as ThisVueStore).$store.subscribeAction(action => {
			if (action.type === "updateUniverse") {
				this.updateShardEntries();
			}
		});
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
			debugMenuDisplaySymbol: Symbol("debug-menu-display"),
			unsubscribe: null as (() => void) | null
		};

		return data;
	},

	/**
	 * Setup.
	 *
	 * @param props - Props
	 * @param param - Context
	 * @returns Composed properties
	 */
	// Force vue inference
	// eslint-disable-next-line @typescript-eslint/typedef
	setup() {
		const stores: Stores = useStores();
		// Infer store
		// eslint-disable-next-line @typescript-eslint/typedef
		const recordStore = stores.useRecordStore();

		const textDirectionRecord: Ref<TextDirectionWords> = recordStore.computedRecord<TextDirectionWords>({
			defaultValue: TextDirectionWords.Auto,
			id: textDirectionSymbol,
			/**
			 * Validator.
			 *
			 * @param value - Value to validate
			 * @returns True, if value is valid
			 */
			validator(value: unknown): value is TextDirectionWords {
				// Casting to enum type, as `includes()` should work with any value
				return Object.values(TextDirectionWords).includes(value as TextDirectionWords);
			}
		});
		// Set initial here for now
		textDirectionRecord.value = TextDirectionWords.Auto;
		const isRtl: Ref<boolean | undefined> = computed(() => {
			switch (textDirectionRecord.value) {
				case TextDirectionWords.Rtl:
					return true;
				case TextDirectionWords.Ltr:
					return false;
				default:
					return undefined;
			}
		});

		const { state }: UniverseStore = useStore() as unknown as UniverseStore;

		const { universe }: UniverseState = state;

		// This value is expected to be rewritten fully on change by child nodes
		// Cast, since type information lost in ref
		const shardEntries: ShallowRef<UniverseUiShardEntries> = shallowRef(new Map()) as Ref<UniverseUiShardEntries>;

		const shardMenus: ComputedRef<Array<CompactToolbarMenu>> = computed(() =>
			Array.from(shardEntries.value).map(
				// ESLint doesn't infer
				// eslint-disable-next-line @typescript-eslint/typedef
				([, shardEntry]) => {
					return shardEntry.menuEntry.menu.value;
				}
			)
		);

		/**
		 * Update shard entries.
		 *
		 * @remarks
		 * The source values are modified outside of vue, so to use model within entries, array remapping needs to preserve model values.
		 */
		function updateShardEntries(): void {
			shardEntries.value = new Map(
				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				Array.from(universe.shards.entries()).map(([shardUuid, shard]) => {
					return [
						shardUuid,
						{
							menuEntry: shardEntries.value.get(shardUuid)?.menuEntry ?? useCompactToolbarMenuConsumer(),
							model: shardEntries.value.get(shardUuid)?.model ?? {
								playerEntries: []
							},
							shard
						}
					];
				})
			);
		}

		return { isRtl, shardEntries, shardMenus, state, updateShardEntries };
	},

	/**
	 * Unmounted hook.
	 */
	unmounted() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}
});
</script>

<style scoped lang="css"></style>
