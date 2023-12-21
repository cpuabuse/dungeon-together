/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Theme composable.
 * @remarks
 * Some constants are created in global scope to save performance.
 */

import { ComputedRef, ShallowRef, computed, shallowRef, watch } from "vue";
import { ThemeInstance, useTheme } from "vuetify";
import { Theme, systemThemeLiteral } from "../../client/gui/themes";
import { Store, StoreWord } from "./store";

/**
 * Global theme symbol.
 */
const themeSymbol: symbol = Symbol("theme");

/**
 * Media query.
 */
const darkThemeMatchMedia: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

/**
 * Reactive, representing system theme.
 */
const isSystemThemeDark: ShallowRef<boolean> = shallowRef(darkThemeMatchMedia.matches);
// Watch system theme
darkThemeMatchMedia.addEventListener("change", event => {
	isSystemThemeDark.value = event.matches;
});

/**
 * System theme.
 */
const systemTheme: ShallowRef<Theme> = computed(() => (isSystemThemeDark.value ? Theme.Dark : Theme.Light));

/**
 * Composable to control theme.
 *
 * @remarks
 * When called from root, performs connection of record used by potentially other components, to actual global theme, that would control `html` element.
 *
 * @param param - Destructured parameter
 * @returns Composable
 */
// Infer composable type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAppTheme({
	recordStore,
	isRoot = false
}: {
	/**
	 * Record store to reuse.
	 */
	recordStore: Store<StoreWord.Record>;

	/**
	 * Whether initialization needs to be done or not.
	 */
	isRoot?: boolean;
}) {
	// Theme recorded in store
	const theme: ComputedRef<string | undefined> = computed(() => {
		const value: unknown = recordStore.records[themeSymbol];

		if (typeof value === "string") {
			if (value === systemThemeLiteral) {
				return systemTheme.value;
			}
			return value;
		}

		return undefined;
	});

	// Once only, add watcher to update global theme
	if (isRoot) {
		const { global }: ThemeInstance = useTheme();
		watch(theme, value => {
			if (value) {
				global.name.value = value;
			}
		});
	}

	return { isSystemThemeDark, theme, themeSymbol };
}

/**
 * Composable return type.
 */
export type AppTheme = ReturnType<typeof useAppTheme>;
