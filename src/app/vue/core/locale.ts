/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Locale vars.
 *
 * @file
 */

import { WritableComputedRef, computed, unref } from "vue";
import { useI18n } from "vue-i18n";

/**
 * Available locales.
 */
export enum Locale {
	English = "en",
	Japanese = "ja",
	Arabic = "ar"
}

/**
 * Fallback locale.
 *
 * @remarks
 * It is easier to manual define a const, than to extract from `useI18n`, since type is a complex union.
 */
export const fallbackLocale: Locale.English = Locale.English;

/**
 * Locales in respective locales.
 */
export const locales: {
	[L1 in Locale]: {
		[L2 in Locale]: string;
	};
} = {
	[Locale.English]: {
		[Locale.English]: "English",
		[Locale.Japanese]: "Japanese",
		[Locale.Arabic]: "Arabic"
	},
	[Locale.Japanese]: {
		[Locale.English]: "英語",
		[Locale.Japanese]: "日本語",
		[Locale.Arabic]: "アラビア語"
	},
	[Locale.Arabic]: {
		[Locale.English]: "الإنجليزية",
		[Locale.Japanese]: "اليابانية",
		[Locale.Arabic]: "العربية"
	}
};

/**
 * Locale composable.
 *
 * @returns Locale composable instance members
 */
// Force infer return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLocale() {
	// Infer type as it is not provided by library
	// eslint-disable-next-line @typescript-eslint/typedef
	const { t, locale: localeRef } = useI18n();

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

	return { Locale, fallbackLocale, isValidLocale, locale, locales, t };
}
