/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Locale vars.
 *
 * @file
 */

import { ComputedRef, WritableComputedRef, computed, unref } from "vue";
import { UseI18nOptions, useI18n } from "vue-i18n";
import { RtlInstance, useLocale as useVuetifyLocale } from "vuetify";
import { Locale } from "../../common/locale";

/**
 * Text direction index.
 */
export const textDirectionSymbol: unique symbol = Symbol("text-direction");

/**
 * Words to describe text direction.
 */
export enum TextDirectionWords {
	Auto = "auto",
	Ltr = "ltr",
	Rtl = "rtl"
}

/**
 * Fallback locale.
 *
 * @remarks
 * It is easier to manual define a const, than to extract from `useI18n`, since type is a complex union.
 */
export const fallbackLocale: Locale.English = Locale.English;

/**
 * Alias for i18n node types.
 */
type I18NMessage = string;

/**
 * Locale composable.
 *
 * @returns Locale composable instance members
 */
// Force infer return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLocale() {
	/*
		From [Composition API | Vue I18n (intlify.dev)](https://vue-i18n.intlify.dev/api/composition):
		`rt` differs from `t` in that it processes the locale message directly, not the key of the locale message. There is no internal fallback with `rt`. You need to understand and use the structure of the locale messge returned by `tm`.
	*/
	// Infer type as it is not provided by library
	// eslint-disable-next-line @typescript-eslint/typedef
	const {
		t,
		locale: localeRef,
		// ESLint does not like library function
		// eslint-disable-next-line @typescript-eslint/unbound-method
		tm,
		rt
	} = useI18n<
		UseI18nOptions<{
			/**
			 * Message schema definition for {@link UseI18nOptions}.
			 */
			message: {
				/**
				 * Stories.
				 */
				storyNotification: {
					/**
					 * Story messages.
					 */
					[StoryKey in string]: {
						/**
						 * Paragraphs.
						 */
						paragraphs: Array<I18NMessage>;
					};
				};

				/**
				 * Language.
				 */
				language: I18NMessage;

				/**
				 * Locales.
				 */
				locales: Record<Locale, I18NMessage>;

				/**
				 * Menu item info.
				 */
				menuItem: Record<string, I18NMessage>;

				/**
				 * Menu titles.
				 */
				menuTitle: Record<string, I18NMessage>;

				/**
				 * Status notification.
				 */
				statusNotification: Record<string, I18NMessage>;

				/**
				 * Theme.
				 */
				theme: Record<string, I18NMessage>;
			};
		}>
	>();
	const { isRtl }: RtlInstance = useVuetifyLocale();

	/**
	 * Checks if string is a valid locale.
	 *
	 * @remarks
	 * Cannot destructure - {@link https://github.com/microsoft/TypeScript/issues/41173}.
	 *
	 * @param locale - Locale to check
	 * @returns True, if is locale
	 */
	function isValidLocale(locale: Locale | string): locale is Locale {
		return (Object.values(Locale).includes as (param: string) => param is Locale)(locale);
	}

	// Computed locale
	const locale: WritableComputedRef<Locale> = computed({
		/**
		 * Locale getter.
		 *
		 * @returns Locale
		 */
		get(): Locale {
			let localUnref: Locale | string = unref(localeRef);
			// Validate type
			if (isValidLocale(localUnref)) {
				return localUnref;
			}

			// TODO: Log error

			// Locale broken, default to English
			return Locale.English;
		},

		/**
		 * Locale setter.
		 *
		 * @param value - Locale to set
		 */
		set(value: Locale) {
			localeRef.value = value;
		}
	});

	/**
	 * Computed property checking if current language is visually short even if capitalized.
	 */
	const isShortWhenCapitalized: ComputedRef<boolean> = computed(() => {
		return [Locale.Arabic].includes(locale.value);
	});

	return {
		Locale,
		fallbackLocale,
		isRtl,
		isShortWhenCapitalized,
		isValidLocale,
		locale,
		rt,
		t,
		tm
	};
}

/**
 * Return type of `useLocale()`.
 */
export type UsedLocale = ReturnType<typeof useLocale>;
