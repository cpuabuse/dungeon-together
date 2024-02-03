/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { ExternalMessageSchema } from "../common/i18n";
import { Locale } from "../common/locale";

/**
 * Core module.
 */

/**
 * Messages to be optionally populated by modules.
 */
export type ModuleLocalePartialMessages = { [Key in Locale]?: Partial<ExternalMessageSchema> };

/**
 * Module locale messages indexed by module names, for intermediate storage and transfer.
 */
export type ModuleLocaleMessagesRegistry = Record<string, ModuleLocalePartialMessages>;
