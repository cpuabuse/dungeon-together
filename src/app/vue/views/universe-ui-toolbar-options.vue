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
import { OverlayList, OverlayWindow } from "../components";
import { CompactToolbarMenuItem } from "../core/compact-toolbar";
import { useLocale } from "../core/locale";
import { OverlayListItemEntry, OverlayListItemEntryType } from "../core/overlay";
import { useRecords } from "../core/store";

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
				const symbolValue: unknown = this.records[this.optionsMenuDisplaySymbol];

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
				this.records[this.optionsMenuDisplaySymbol] = value;
			}
		},

		language: {
			/**
			 * Gets language string.
			 *
			 * @returns Boolean value
			 */
			get(): string | undefined {
				const value: unknown = this.records[this.languageSymbol];

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
				this.records[this.languageSymbol] = value;
			}
		},

		/**
		 * Model to emit.
		 *
		 * @returns Model helper type
		 */
		model(): ModelType {
			return {
				menuItems: [
					{
						clickRecordIndex: this.optionsMenuDisplaySymbol,
						icon: "fa-list-check",
						name: this.name
					}
				],

				windowItems: [
					{
						icon: "fa-language",

						id: this.languageSymbol,

						// False negative
						// eslint-disable-next-line @typescript-eslint/typedef
						items: Object.entries(this.Locale).map(([name, value]) => {
							return {
								name: `${this.locales[value][value]} (${value === this.fallbackLocale ? "" : `${name}, `}${value})`,
								value
							};
						}),

						name: `${this.t("language")}${
							// Display additionally language in fallback, when not in fallback
							this.locale === this.fallbackLocale ? "" : ` (${this.t("language", 1, { locale: this.fallbackLocale })})`
						}`,

						type: OverlayListItemEntryType.Select
					}
				]
			};
		},

		/**
		 * Options window title.
		 *
		 * @returns Title
		 */
		name(): string {
			return "Options";
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
			// Symbol to index language in store records.
			languageSymbol: Symbol("language"),

			// A key to force re-render the list; Used for removing transitions and animations(VSelect), when rtl changes; Assigning to whole list might be a crude, but it is best performance for code impact; In principle this should be handled by Vuetify, as on language change other overlays would mess up
			listKey: "tick" as "tick" | "tock",

			optionsMenuDisplaySymbol: Symbol("options-menu-display")
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
		return { ...useRecords(), ...useLocale() };
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
					const isOldRtl: boolean = this.isRtl;
					this.locale = value;
					// `this.isRtl !== isOldRtl` check is ommited, to make behavior identical, regardless of locale direction
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
		}
	}
});
</script>

<style scoped lang="css"></style>
