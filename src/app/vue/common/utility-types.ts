/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vue utility types.
 *
 * @file
 */

import { Ref } from "vue";

/**
 * Maybe ref.
 */
export type MaybeRef<T> = T | Ref<T>;

/**
 * Maybe ref of div or null.
 */
export type MaybeRefHTMLDivElementOrNull = MaybeRef<HTMLDivElement | null>;

/**
 * Maybe ref of {@link HTMLElement} or null.
 */
export type MaybeRefHTMLElementOrNull = MaybeRef<HTMLElement | null>;
