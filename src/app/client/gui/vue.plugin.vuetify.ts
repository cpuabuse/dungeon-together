/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Initializes Vuetify plugin.
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { App } from "vue";
import { createI18n, useI18n } from "vue-i18n";
import { createVuetify } from "vuetify";
import * as directives from "vuetify/directives";
import { aliases, fa } from "vuetify/iconsets/fa-svg";
import { ar, en, ja } from "vuetify/locale";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

// Initialize Vuetify
import "../style/vuetify.scss";
import { ExternalMessageSchema, InternalMessageSchema, internalLocaleMessages } from "../../common/i18n";
import { Locale } from "../../common/locale";

// Initialize FA
library.add(fas);
library.add(far);

/**
 * Map of locales to vuetify locale messages.
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
const localeVuetifyMap = {
	[Locale.Arabic]: ar,
	[Locale.English]: en,
	[Locale.Japanese]: ja
	// Guarantees exhaustiveness
} as const satisfies { [Key in Locale]: unknown };

/**
 * Typed map of locale to Vuetify locale messages.
 */
type LocaleVuetifyMap = typeof localeVuetifyMap;

/**
 * Final message schema, type defaults to all locales, to include everything Vuetify provides across all languages.
 */
export type MessageSchema<K extends Locale = Locale> = InternalMessageSchema & {
	/**
	 * For translation of Vuetify internals.
	 */
	$vuetify: LocaleVuetifyMap[K];

	/**
	 * Schema recieved from modules, normalized via merge.
	 */
	module: Record<string, ExternalMessageSchema>;
};

/**
 * Internal(non-module) schema.
 *
 * @remarks
 * Schema could be inferred from English, and applied to rest, but it should not be too big of a type to explicitly define.
 */
export type LocaleMessages = {
	[Key in Locale]: MessageSchema<Key>;
};

/**
 * Uses Vuetify plugin on app.
 *
 * @param param - Destructured parameter
 * @returns "i18n" instance
 */
// Infer return type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useVuetifyPlugin({
	app
}: {
	/**
	 * Vue application.
	 */
	app: App;
}) {
	// No type exported, infer
	// eslint-disable-next-line @typescript-eslint/typedef
	const i18n = createI18n({
		fallbackLocale: "en",
		legacy: false,
		// Vuetify does not support the legacy mode of vue-i18n
		locale: "en",
		// Casting to fix `entries()` type
		messages: (
			Object.entries(internalLocaleMessages) as unknown as Array<
				[keyof typeof internalLocaleMessages, (typeof internalLocaleMessages)[keyof typeof internalLocaleMessages]]
			>
		)
			// ESLint false negative
			// eslint-disable-next-line @typescript-eslint/typedef
			.reduce((result, [lang, msg]) => {
				const r: LocaleMessages = {
					...result,
					[lang]: {
						...msg,
						$vuetify: localeVuetifyMap[lang],
						module: {}
					} satisfies LocaleMessages[typeof lang]
				};

				return r;
			}, {} as LocaleMessages)
	});

	// Add icon component
	app.component("font-awesome-icon", FontAwesomeIcon);
	app.use(i18n);

	// Add Vuetify
	app.use(
		createVuetify({
			directives,
			icons: {
				aliases,
				defaultSet: "fa",
				sets: {
					fa
				}
			},
			locale: {
				adapter: createVueI18nAdapter({ i18n, useI18n })
			}
		})
	);

	return i18n;
}

/**
 * Type for i18n with prefix to avoid ambiguity.
 */
export type AppI18n = ReturnType<typeof useVuetifyPlugin>;
