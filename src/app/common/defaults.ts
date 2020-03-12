/*
	File: src/app/common/defaults.ts
	cpuabuse.com
*/

/**
 * Defaults.
 */

/**
 * Default kinds for worlds.
 */
export type DefaultKinds = DefaultWords;

/**
 * Default modes for things and RUs.
 */
export type DefaultModes = DefaultWords;

/**
 * Default world names.
 */
export type DefaultWorlds = DefaultWords;

/**
 * Default words to use for other types.
 */
type DefaultWords = "default";

// At the top, since other consts depend on it
/**
 * Default word to use for other defaults.
 */
const defaultWord: DefaultWords = "default";

/**
 * List of defualt words.
 */
const defaultWords: Array<DefaultWords> = ["default"];

/**
 * Literally default kind name.
 */
export const defaultKind: DefaultKinds = defaultWord;

/**
 * Default kind names.
 */
export const defaultKinds: Array<DefaultKinds> = defaultWords;

/**
 * Literally default world name.
 */
export const defaultWorld: DefaultWorlds = defaultWord;

/**
 * List for default world names.
 */
export const defaultWorlds: Array<DefaultWorlds> = defaultWords;

/**
 * Literally default mode.
 */
export const defaultMode: DefaultModes = defaultWord;

/**
 * List for default modes.
 */
export const defaultModes: Array<DefaultModes> = defaultWords;
