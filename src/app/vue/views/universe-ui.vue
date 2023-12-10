<!-- Universe UI -->
<template>
	<VLocaleProvider :rtl="isRtl">
		<!-- Vuetify unconditionally displays bar at the top of the screen -->
		<UniverseUiInfoBar :shard-entries="(shardEntries as UniverseUiShardEntries)" />

		<!-- Casting since class type information lost -->
		<UniverseUiClick :rc-menu-data="inputStore.rcMenuData" />

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
// Used in template only
// eslint-disable-next-line @typescript-eslint/no-unused-vars, import/order
import { type ClientUniverseStateRcMenuData } from "../../client/gui";

import { ComputedRef, Ref, ShallowRef, computed, defineComponent, shallowRef } from "vue";
import { VLocaleProvider } from "vuetify/components";
import { CompactToolbarMenu, useCompactToolbarMenuConsumer } from "../core/compact-toolbar";
import { TextDirectionWords, textDirectionSymbol } from "../core/locale";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { UniverseUiShardEntries } from "../core/universe-ui";
import UniverseUiClick from "./universe-ui-click.vue";
import UniverseUiInfoBar from "./universe-ui-info-bar.vue";
import UniverseUiShard from "./universe-ui-shard.vue";
import UniverseUiToolbar from "./universe-ui-toolbar.vue";

export default defineComponent({
	components: { UniverseUiClick, UniverseUiInfoBar, UniverseUiShard, UniverseUiToolbar, VLocaleProvider },

	/**
	 * Created callback.
	 */
	created() {
		// Init & entries
		this.updateShardEntries();
		this.universeStore.onUpdateUniverse({
			/**
			 * Callback on universe update.
			 */
			callback: () => {
				this.updateShardEntries();
			},
			isImmediate: true
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
			debugMenuDisplaySymbol: Symbol("debug-menu-display")
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
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();
		const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();
		const inputStore: Store<StoreWord.Input> = stores.useInputStore();

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
				Array.from(universeStore.universe.shards.entries()).map(([shardUuid, shard]) => {
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

		return { inputStore, isRtl, shardEntries, shardMenus, universeStore, updateShardEntries };
	}
});
</script>

<style scoped lang="css"></style>
