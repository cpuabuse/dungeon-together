<!-- Universe UI toolbar options menu -->
<template>
	<!-- Overlays display -->
	<OverlayWindow
		v-for="({ listItems, name }, displayItemKey) in displayItems"
		:key="displayItemKey"
		v-model="displayItems[displayItemKey]!.isDisplayed"
		:name="name"
	>
		<template #body>
			<OverlayList :items="listItems" />
		</template>
	</OverlayWindow>
</template>

<script lang="ts">
// Library just exports an object as default
import { utils } from "pixi.js";
import screenfull from "screenfull";
import { Ref, WritableComputedRef, computed, defineComponent, watch, watchEffect } from "vue";
import { Theme, systemThemeLiteral } from "../../client/gui/themes";
import { defaultFps, defaultMobileFps } from "../../common/graphics";
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuItem } from "../core/compact-toolbar";

import { fpsRecordId } from "../core/graphics";
import { TextDirectionWords, UsedLocale, textDirectionSymbol, useLocale } from "../core/locale";
import {
	OverlayBusSource,
	OverlayListItemEntry,
	OverlayListItemEntryType,
	OverlayListItems,
	overlayBusEmits,
	useOverlayBusSource
} from "../core/overlay";
import { Store, StoreWord, Stores, useStores } from "../core/store";
import { AppTheme, useAppTheme } from "../core/theme";

export default defineComponent({
	components: { OverlayList, OverlayWindow },

	computed: {
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
		}
	},

	/**
	 * Created hook.
	 */
	created() {
		// Set current theme record
		this.recordStore.records[this.themeSymbol] = systemThemeLiteral;
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
			// A key to force re-render the list; Used for removing transitions and animations(VSelect), when rtl changes; Assigning to whole list might be a crude, but it is best performance for code impact; In principle this should be handled by Vuetify, as on language change other overlays would mess up
			listKey: "tick" as "tick" | "tock",

			optionsMenuDisplaySymbol: Symbol("options-menu-display")
		};

		return data;
	},

	emits: overlayBusEmits,

	/**
	 * Setup script.
	 *
	 * @param props - Setup props
	 * @param emit - Emit
	 * @returns Records
	 */
	// Infer setup param types
	// eslint-disable-next-line @typescript-eslint/typedef
	setup(props, { emit }) {
		// Stores
		const stores: Stores = useStores();
		const recordStore: Store<StoreWord.Record> = stores.useRecordStore();
		const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();
		const fpsValues: Set<number> = new Set([defaultFps, defaultMobileFps, 15, 30, 60, 90, 120].sort());

		// Theme
		const { themeSymbol, isSystemThemeDark }: AppTheme = useAppTheme({ recordStore });

		// Locale
		const vueLocale: UsedLocale = useLocale();

		// Text direction
		const { Auto: autoWord, ...restWords }: typeof TextDirectionWords = TextDirectionWords;
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

		// Symbol to index language in store records
		const languageSymbol: symbol = Symbol("language");

		// Options symbols
		const optionsOverlaySymbol: symbol = Symbol(
			`menu-universe-ui-toolbar-options-${universeStore.universe.universeUuid}`
		);
		const optionsDisplaySymbol: symbol = Symbol(
			`menu-universe-ui-toolbar-options-${universeStore.universe.universeUuid}`
		);

		// Fullscreen
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

		// FPS local string symbol for select item, and synchronize values, for actual application of new FPS values; Since we are manipulating records directly, no inifinite loop should trigger
		const fpsStringRecordId: symbol = Symbol(
			`menu-universe-ui-toolbar-options-fps-string-${universeStore.universe.universeUuid}`
		);
		watchEffect(() => {
			const fps: unknown = recordStore.records[fpsRecordId];
			if (typeof fps === "number") {
				recordStore.records[fpsStringRecordId] = fps.toString();
			}
		});
		watchEffect(() => {
			const fpsString: unknown = recordStore.records[fpsStringRecordId];
			if (typeof fpsString === "string") {
				// "NaN" would work fine with the way graphics fps processes it, as default would be provided
				recordStore.records[fpsRecordId] = parseInt(fpsString, 10);
			}
		});

		// Menu data
		const languageListItemEntry: Ref<OverlayListItemEntry> = computed(() => ({
			icon: "fa-language",

			id: languageSymbol,

			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			items: Object.entries(vueLocale.Locale).map(([name, value]) => {
				return {
					name: `${vueLocale.t(`locales.${value}`, 1, { locale: value })} (${
						value === vueLocale.fallbackLocale ? "" : `${name}, `
					}${value})`,
					value
				};
			}),

			name: `${vueLocale.t("language")}${
				// Display additionally language in fallback, when not in fallback
				vueLocale.locale.value === vueLocale.fallbackLocale
					? ""
					: ` (${vueLocale.t("language", 1, { locale: vueLocale.fallbackLocale })})`
			}`,

			type: OverlayListItemEntryType.Select
		}));

		const textDirectionListItemEntry: Ref<OverlayListItemEntry> = computed(() => ({
			icon: "fa-arrow-right-arrow-left",

			id: textDirectionSymbol,

			items: [
				// Auto
				{
					name: `${vueLocale.t(`textDirection.${autoWord}`)} (${vueLocale.t(
						`textDirection.${vueLocale.isRtl.value ? TextDirectionWords.Rtl : TextDirectionWords.Ltr}`
					)})`,
					value: autoWord
				},

				// Rest
				...Object.values(restWords).map(textDirectionWord => ({
					name: `${vueLocale.t(`textDirection.${textDirectionWord}`)}`,
					value: textDirectionWord
				}))
			],

			name: vueLocale.t("menuItem.textDirection"),

			type: OverlayListItemEntryType.Select
		}));

		const fpsListItemEntry: Ref<OverlayListItemEntry> = computed(() => {
			let isMobile: boolean = utils.isMobile.any;
			let defaultValue: string = (isMobile ? defaultMobileFps : defaultFps).toString();
			let defaultDescription: string = ` (Default ${isMobile ? "mobile" : "desktop"})`;

			return {
				id: fpsStringRecordId,
				items: Array.from(fpsValues).map(numberValue => {
					let value: string = numberValue.toString();

					// Default value might already be set, so there is not way to optimize the algorithm for mapping
					return {
						name: `${value}${value === defaultValue ? defaultDescription : ""}`,
						value
					};
				}),
				name: "FPS",
				type: OverlayListItemEntryType.Select
			};
		});

		const fullscreenListItemEntry: Ref<OverlayListItemEntry> = computed(() => ({
			icon: "fa-expand",
			id: fullscreenSymbol,
			// TODO: Add translation
			name: "Fullscreen",
			type: OverlayListItemEntryType.Switch
		}));
		const themeListItemEntry: Ref<OverlayListItemEntry> = computed(() => ({
			icon: "fa-circle-half-stroke",

			id: themeSymbol,

			// False negative
			// eslint-disable-next-line @typescript-eslint/typedef
			items: [
				{
					name: `System (${vueLocale.t(`theme.${isSystemThemeDark.value ? Theme.Dark : Theme.Light}`)})`,
					value: systemThemeLiteral
				},
				...Object.values(Theme).map(value => {
					return {
						name: vueLocale.t(`theme.${value}`),
						value
					};
				})
			],
			name: vueLocale.t("menuItem.theme"),

			type: OverlayListItemEntryType.Select
		}));

		// Menu
		const { displayItems }: OverlayBusSource = useOverlayBusSource({
			emit,
			menuItemsRegistryIndex: optionsOverlaySymbol,
			overlayItems: [
				// Welcome screen
				{
					listItems: computed(() => {
						return [
							{
								tabs: [
									// System tab
									{
										items: [
											// Language
											languageListItemEntry.value,

											// Text direction
											textDirectionListItemEntry.value,

											// Theme
											themeListItemEntry.value,

											// Fullscreen
											fullscreenListItemEntry.value
										],
										name: "System"
									},

									// Game tab
									{
										items: [],
										name: "Game"
									},

									// Video tab
									{
										items: [fpsListItemEntry.value],
										name: "Video"
									},

									// Audio tab
									{
										items: [],
										name: "Audio"
									}
								],
								type: OverlayListItemEntryType.Tab
							}
						] satisfies OverlayListItems;
					}),
					menuItem: computed(() => {
						return {
							clickRecordIndex: optionsDisplaySymbol,
							icon: "fa-list-check",
							name: vueLocale.t("menuTitle.options")
						} satisfies CompactToolbarMenuItem;
					})
				}
			],
			recordStore
		});

		return {
			recordStore,
			...vueLocale,
			displayItems,
			languageSymbol,
			textDirectionRecord,
			themeSymbol
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
		}
	}
});
</script>

<style scoped lang="css"></style>
