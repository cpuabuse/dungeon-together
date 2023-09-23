/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Initializes Vuetify plugin.
 *
 * @file
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { App } from "vue";
import { createI18n, useI18n } from "vue-i18n";
import { createVuetify } from "vuetify";
import { aliases, fa } from "vuetify/iconsets/fa-svg";
import { ar, en, ja } from "vuetify/locale";
import { createVueI18nAdapter } from "vuetify/locale/adapters/vue-i18n";

// Initialize Vuetify
import "../style/vuetify.scss";
import { StatusNotificationWord } from "../../common/defaults/connection";
import { Locale, locales } from "../../vue/core/locale";
import { Theme } from "./themes";

// Initialize FA
library.add(fas);
library.add(far);

/**
 * Messages for i18n.
 */
// Infer messages type
// eslint-disable-next-line @typescript-eslint/typedef
const messages = {
	ar: {
		$vuetify: ar,
		language: "اللغة",
		locales: locales[Locale.Arabic],
		menuItem: {
			textDirection: "اتجاه النص",
			theme: "موضوع"
		},
		menuTitle: {
			options: "خيارات",
			system: "النظام"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "تحقق من حولك",
			[StatusNotificationWord.MimicAwaken]: "ظهر الميميك!"
		},
		theme: {
			[Theme.Dark]: "الظلام",
			[Theme.Light]: "ضوء"
		}
	},
	en: {
		$vuetify: en,
		language: "Language",
		locales: locales[Locale.English],
		menuItem: {
			textDirection: "Text direction",
			theme: "Theme"
		},
		menuTitle: {
			options: "Options",
			system: "System"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "You look around",
			[StatusNotificationWord.MimicAwaken]: "Mimic awakens!"
		},
		theme: {
			[Theme.Dark]: "Dark",
			[Theme.Light]: "Light"
		}
	},
	ja: {
		$vuetify: ja,
		language: "言語",
		locales: locales[Locale.Japanese],
		menuItem: {
			// Pronunciation: "しょじほうこう"
			textDirection: "書字方向",
			theme: "テーマ"
		},
		menuTitle: {
			options: "オプション",
			system: "システム"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "周りを見回す",
			[StatusNotificationWord.MimicAwaken]: "ミミックが現れた！"
		},
		theme: {
			[Theme.Dark]: "ライト",
			[Theme.Light]: "ダーク"
		}
	}
};

/**
 * Uses Vuetify plugin on app.
 *
 * @param param - Destructured parameter
 */
export function useVuetifyPlugin({
	app
}: {
	/**
	 * Vue application.
	 */
	app: App;
}): void {
	// No type exported, infer
	// eslint-disable-next-line @typescript-eslint/typedef
	const i18n = createI18n({
		fallbackLocale: "en",
		legacy: false,
		// Vuetify does not support the legacy mode of vue-i18n
		locale: "en",
		messages
	});

	// Add icon component
	app.component("font-awesome-icon", FontAwesomeIcon);
	app.use(i18n);

	// Add Vuetify
	app.use(
		createVuetify({
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
}
