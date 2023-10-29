<!-- Universe UI toolbar options menu -->
<template>
	<OverlayWindow v-model="isOptionsMenuDisplayed" icon="fa-list-check" :name="name">
		<template #body>
			<OverlayList :key="listKey" :items="modelValue.windowItems" />
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";
import { Theme } from "../../client/gui/themes";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuItem } from "../core/compact-toolbar";
import { useLocale } from "../core/locale";
import { OverlayListItemEntry, OverlayListItemEntryType } from "../core/overlay";
import { Stores, useStores } from "../core/store";

/**
 * Model type helper.
 *
 * @remarks
 * Both properties being an array removes necessity for many checks.
 */
type ModelType = Record<"windowItems", Array<OverlayListItemEntry>> &
	Record<"menuItems", Array<CompactToolbarMenuItem>>;

export default defineComponent({
	components: { OverlayList, OverlayWindow },

	computed: {
		isOptionsMenuDisplayed: {
			/**
			 * Gets debug container display record.
			 *
			 * @returns Boolean value
			 */
			get(): boolean {
				const symbolValue: unknown = this.recordStore.records[this.optionsMenuDisplaySymbol];

				if (symbolValue) {
					return true;
				}

				return false;
			},

			/**
			 * Sets debug container display record.
			 *
			 * @param value - Boolean value to set
			 */
			set(value: boolean) {
				this.recordStore.records[this.optionsMenuDisplaySymbol] = value;
			}
		},

		language: {
			/**
			 * Gets language string.
			 *
			 * @returns Boolean value
			 */
			get(): string | undefined {
				const value: unknown = this.recordStore.records[this.languageSymbol];

				if (value && typeof value === "string") {
					return value;
				}

				return undefined;
			},

			/**
			 * Sets debug container display record.
			 *
			 * @param value - Boolean value to set
			 */
			set(value: string) {
				this.recordStore.records[this.languageSymbol] = value;
			}
		},

		/**
		 * Language change window item.
		 *
		 * @returns Language change window item
		 */
		languageChangeWindowItem(): OverlayListItemEntry {
			return {
				icon: "fa-language",

				id: this.languageSymbol,

				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				items: Object.entries(this.Locale).map(([name, value]) => {
					return {
						name: `${this.t(`locales.${value}`, 1, { locale: value })} (${
							value === this.fallbackLocale ? "" : `${name}, `
						}${value})`,
						value
					};
				}),

				name: `${this.t("language")}${
					// Display additionally language in fallback, when not in fallback
					this.locale === this.fallbackLocale ? "" : ` (${this.t("language", 1, { locale: this.fallbackLocale })})`
				}`,

				type: OverlayListItemEntryType.Select
			};
		},

		/**
		 * Menu items.
		 *
		 * @returns Menu items
		 */
		menuItems(): Array<CompactToolbarMenuItem> {
			return [
				{
					clickRecordIndex: this.optionsMenuDisplaySymbol,
					icon: "fa-list-check",
					name: this.name
				}
			];
		},

		/**
		 * Model to emit.
		 *
		 * @returns Model helper type
		 */
		model(): ModelType {
			return {
				menuItems: this.menuItems,

				windowItems: [
					this.languageChangeWindowItem,
					this.textDirectionWindowItem,
					this.themeWindowItem

					// Color scheme

					// Compact UI
				]
			};
		},

		/**
		 * Options window title.
		 *
		 * @returns Title
		 */
		name(): string {
			return this.t("menuTitle.options");
		},

		/**
		 * Text direction window item.
		 *
		 * @returns Text direction window item
		 */
		textDirectionWindowItem(): OverlayListItemEntry {
			return {
				icon: "fa-arrow-right-arrow-left",

				id: "direction",

				items: [
					{ name: "ltr", value: "ltr" },
					{ name: "rtl", value: "rtl" },
					{ name: "auto", value: "auto" }
				],

				name: this.t("menuItem.textDirection"),

				type: OverlayListItemEntryType.Select
			};
		},

		/**
		 * Theme.
		 *
		 * @returns Theme name
		 */
		theme: {
			/**
			 * Gets theme string.
			 *
			 * @returns Boolean value
			 */
			get(): string | undefined {
				const value: unknown = this.recordStore.records[this.themeSymbol];

				if (value && typeof value === "string") {
					return value;
				}

				return undefined;
			},

			/**
			 * Sets debug container display record.
			 *
			 * @param value - Boolean value to set
			 */
			set(value: string) {
				this.recordStore.records[this.themeSymbol] = value;
			}
		},

		/**
		 * Theme window item.
		 *
		 * @returns Theme window item
		 */
		themeWindowItem(): OverlayListItemEntry {
			return {
				icon: "fa-circle-half-stroke",

				id: this.themeSymbol,

				// False negative
				// eslint-disable-next-line @typescript-eslint/typedef
				items: Object.values(Theme).map(value => {
					return {
						name: this.t(`theme.${value}`),
						value
					};
				}),

				name: this.t("menuItem.theme"),

				type: OverlayListItemEntryType.Select
			};
		}
	},

	/**
	 * Created hook.
	 */
	created() {
		this.$emit("update:modelValue", this.model);
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
			// Symbol to index language in store records
			languageSymbol: Symbol("language"),

			// A key to force re-render the list; Used for removing transitions and animations(VSelect), when rtl changes; Assigning to whole list might be a crude, but it is best performance for code impact; In principle this should be handled by Vuetify, as on language change other overlays would mess up
			listKey: "tick" as "tick" | "tock",

			optionsMenuDisplaySymbol: Symbol("options-menu-display"),

			// Symbol to index theme in store
			themeSymbol: Symbol("theme")
		};

		return data;
	},

	emits: ["update:modelValue"],

	props: {
		modelValue: {
			required: true,
			type: Object as PropType<ModelType>
		}
	},

	/**
	 * Setup script.
	 *
	 * @returns Records
	 */
	setup() {
		const stores: Stores = useStores();
		// Infer store
		// eslint-disable-next-line @typescript-eslint/typedef
		const recordStore = stores.useRecordStore();

		return { recordStore, ...useLocale(), themeGlobal: useTheme().global };
	},

	watch: {
		/**
		 * Watch language and change locale.
		 *
		 * @param value - New language value
		 */
		language(value: string): void {
			if (this.isValidLocale(value)) {
				if (this.locale !== value) {
					this.locale = value;
					// `this.isRtl !== isOldRtl` check is omitted, to make behavior identical, regardless of locale direction
					if (this.listKey === "tick") {
						this.listKey = "tock";
					} else {
						this.listKey = "tick";
					}
				}
			}
		},

		locale: {
			/**
			 * Watch language and change locale.
			 *
			 * @param value - New language value
			 */
			handler(value: string): void {
				if (this.language !== value) {
					this.language = value;
				}
			},

			// Immediately initialize variable for select
			immediate: true
		},

		model: {
			/**
			 * Watch model and emit.
			 *
			 * @param value - New model value
			 */
			handler(value: ModelType): void {
				this.$emit("update:modelValue", value);
			},

			// Overwrite given value immediately
			immediate: true
		},

		/**
		 * Watch theme and change theme.
		 *
		 * @param value - New theme value
		 */
		theme(value: string): void {
			this.themeGlobal.name.value = value;
		}
	}
});
</script>

<style scoped lang="css"></style>
