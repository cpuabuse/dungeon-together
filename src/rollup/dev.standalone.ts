/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Standalone compilation
 */

import { defineOptions } from "./base";

export default defineOptions({ environment: "dev", isIncremental: true, isProduction: false });
