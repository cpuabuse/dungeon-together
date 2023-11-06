<!-- Universe UI toolbar options menu -->
<template>
	<OverlayWindow v-model="isOptionsMenuDisplayed" icon="fa-list-check" :name="name">
		<template #body>
			<OverlayList :key="listKey" :items="[...modelValue.windowItems, fullscreenOverlayListItem]" />
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
// Library just exports an object as default
import screenfull from "screenfull";
import { PropType, Ref, WritableComputedRef, computed, defineComponent, watch } from "vue";
import { useTheme } from "vuetify/lib/framework.mjs";
import { Theme, systemThemeLiteral } from "../../client/gui/themes";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuItem } from "../core/compact-toolbar";
import { TextDirectionWords, textDirectionSymbol, useLocale } from "../core/locale";
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

				if (typeof value === "string") {
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
		 * System theme.
		 *
		 * @returns Theme
		 */
		systemTheme(): Theme {
			return this.isSystemThemeDark ? Theme.Dark : Theme.Light;
		},

		/**
		 * Text direction window item.
		 *
		 * @returns Text direction window item
		 */
		textDirectionWindowItem(): OverlayListItemEntry {
			const { Auto: autoWord, ...restWords }: typeof TextDirectionWords = TextDirectionWords;

			return {
				icon: "fa-arrow-right-arrow-left",

				id: textDirectionSymbol,

				items: [
					// Auto
					{
						name: `${this.t(`textDirection.${autoWord}`)} (${this.t(
							`textDirection.${this.isRtl ? TextDirectionWords.Rtl : TextDirectionWords.Ltr}`
						)})`,
						value: autoWord
					},

					// Rest
					...Object.values(restWords).map(textDirectionWord => ({
						name: `${this.t(`textDirection.${textDirectionWord}`)}`,
						value: textDirectionWord
					}))
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
		theme(): string | undefined {
			const value: unknown = this.recordStore.records[this.themeSymbol];

			if (typeof value === "string") {
				if (value === systemThemeLiteral) {
					return this.systemTheme;
				}
				return value;
			}

			return undefined;
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
				items: [
					{
						name: `System (${this.t(`theme.${this.systemTheme}`)})`,
						value: systemThemeLiteral
					},
					...Object.values(Theme).map(value => {
						return {
							name: this.t(`theme.${value}`),
							value
						};
					})
				],
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

		// Watch system theme
		this.darkThemeMatchMedia.addEventListener("change", event => {
			this.isSystemThemeDark = event.matches;
		});

		// Set current theme record
		this.recordStore.records[this.themeSymbol] = systemThemeLiteral;
	},

	/**
	 * Vue data.
	 *
	 * @returns Universe data
	 */
	data() {
		const darkThemeMatchMedia: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

		// Infer type
		// eslint-disable-next-line @typescript-eslint/typedef
		let data = {
			darkThemeMatchMedia,

			// Initial state only
			isSystemThemeDark: darkThemeMatchMedia.matches,

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

		const fullscreenSymbol: symbol = Symbol("fullscreen");
		const isFullscreen: Ref<boolean> = recordStore.computedRecord({
			id: fullscreenSymbol
		});
		const isDocumentFullscreen: WritableComputedRef<boolean> = computed({
			/**
			 * Getter for fullscreen.
			 *
			 * @returns True, if document is in fullscreen
			 */
			get(): boolean {
				return screenfull.isFullscreen;
			},
			/**
			 * Setter for fullscreen.
			 *
			 * @remarks
			 * It seems that it is impossible to track F11 fullscreen.
			 *
			 * @param value - Value to set
			 */
			set(value: boolean): void {
				if (isFullscreen.value !== screenfull.isFullscreen) {
					if (value) {
						screenfull.request().catch(() => {
							// TODO: Log error through universe
						});
					} else {
						screenfull.exit().catch(() => {
							// TODO: Log error through universe
						});
					}
				}
			}
		});
		watch(isFullscreen, value => {
			isDocumentFullscreen.value = value;
		});
		// This listener lives together with the fullscreen record, not the component, thus it is not necessary to de-register
		screenfull.onchange(() => {
			isFullscreen.value = screenfull.isFullscreen;
		});

		const fullscreenOverlayListItem: OverlayListItemEntry = {
			icon: "fa-expand",
			id: fullscreenSymbol,
			// TODO: Add translation
			name: "Fullscreen",
			type: OverlayListItemEntryType.Switch
		};

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

		return {
			recordStore,
			...useLocale(),
			fullscreenOverlayListItem,
			textDirectionRecord,
			themeGlobal: useTheme().global
		};
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
