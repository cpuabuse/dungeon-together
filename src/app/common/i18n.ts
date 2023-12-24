/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * I18n.
 */

import { Theme, systemThemeLiteral } from "../client/gui/themes";
import { TextDirectionWords } from "../vue/core/locale";
import { StatusNotificationWord } from "./defaults/connection";
import { Locale } from "./locale";

/**
 * Alias for i18n node types.
 */
type I18NMessage = string;

/**
 * Internal(non-module) schema.
 */
export type InternalMessageSchema = {
	/**
	 * Word for language.
	 */
	language: I18NMessage;

	/**
	 * Words for locales, names of languages in respective languages.
	 */
	locales: Record<Locale, I18NMessage>;

	/**
	 * Titles for menus and menu items.
	 */
	menuTitle: {
		/**
		 * Debug menu item.
		 */
		debug: I18NMessage;

		/**
		 * Options menu item.
		 */
		options: I18NMessage;

		/**
		 * Player menu item.
		 */
		player: I18NMessage;

		/**
		 * System menu.
		 */
		system: I18NMessage;
	};

	/**
	 * Data going into menu items.
	 */
	menuItem: Record<string, I18NMessage>;

	/**
	 * Status notification.
	 */
	statusNotification: Record<string, I18NMessage>;

	/**
	 * Messages for text direction.
	 */
	textDirection: Record<TextDirectionWords, I18NMessage>;

	/**
	 * Theme.
	 */
	theme: Record<string, I18NMessage>;
};

/**
 * Module schema produces by modules.
 *
 * @remarks
 * Works from the context of the module, when injected into Vue, would be restructured.
 */
export type ExternalMessageSchema = {
	/**
	 * Stories.
	 */
	storyNotification: {
		/**
		 * Story messages.
		 */
		[key: string]: {
			/**
			 * Paragraphs.
			 */
			paragraphs: Array<I18NMessage>;
		};
	};
};

/**
 * Messages for i18n.
 */
// Infer messages type
// eslint-disable-next-line @typescript-eslint/typedef
export const internalLocaleMessages = {
	[Locale.Arabic]: {
		language: "اللغة",
		locales: {
			[Locale.English]: "الإنجليزية",
			[Locale.Japanese]: "اليابانية",
			[Locale.Arabic]: "العربية"
		},
		menuItem: {
			textDirection: "اتجاه النص",
			theme: "موضوع"
		},
		menuTitle: {
			debug: "تصحيح الأخطاء",
			options: "خيارات",
			player: "اللاعب",
			system: "النظام"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "تحقق من حولك",
			[StatusNotificationWord.MimicAwaken]: "ظهر الميميك!"
		},
		textDirection: {
			[TextDirectionWords.Auto]: "Auto",
			[TextDirectionWords.Ltr]: "Left-to-right",
			[TextDirectionWords.Rtl]: "Right-to-left"
		},
		theme: {
			[Theme.Dark]: "الظلام",
			[Theme.Light]: "ضوء"
		}
	} satisfies InternalMessageSchema,
	[Locale.English]: {
		language: "Language",
		locales: {
			[Locale.English]: "English",
			[Locale.Japanese]: "Japanese",
			[Locale.Arabic]: "Arabic"
		},
		menuItem: {
			textDirection: "Text direction",
			theme: "Theme"
		},
		menuTitle: {
			debug: "Debug",
			options: "Options",
			player: "Player",
			system: "System"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "You look around",
			[StatusNotificationWord.MimicAwaken]: "Mimic awakens!",
			[StatusNotificationWord.DamageDealt]: "⚔️ {damage}"
		},
		textDirection: {
			[TextDirectionWords.Auto]: "Auto",
			[TextDirectionWords.Ltr]: "Left-to-right",
			[TextDirectionWords.Rtl]: "Right-to-left"
		},
		theme: {
			[Theme.Dark]: "Dark",
			[Theme.Light]: "Light",
			[systemThemeLiteral]: "System"
		}
	} satisfies InternalMessageSchema,
	[Locale.Japanese]: {
		language: "言語",
		locales: {
			[Locale.English]: "英語",
			[Locale.Japanese]: "日本語",
			[Locale.Arabic]: "アラビア語"
		},
		menuItem: {
			// Pronunciation: "しょじほうこう"
			textDirection: "書字方向",
			theme: "テーマ"
		},
		menuTitle: {
			debug: "デバッグ",
			options: "オプション",
			player: "プレイヤー",
			system: "システム"
		},
		statusNotification: {
			[StatusNotificationWord.Sync]: "周りを見回す",
			[StatusNotificationWord.MimicAwaken]: "ミミックが現れた！"
		},
		textDirection: {
			[TextDirectionWords.Auto]: "Auto",
			[TextDirectionWords.Ltr]: "Left-to-right",
			[TextDirectionWords.Rtl]: "Right-to-left"
		},
		theme: {
			[Theme.Dark]: "ダーク",
			[Theme.Light]: "ライト"
		}
	} satisfies InternalMessageSchema
} as const;
