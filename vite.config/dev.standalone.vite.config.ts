/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vite config for dev standalone.
 *
 * @file
 */

import { defineBase } from "./base.vite.config";

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

export default defineBase({ build: "standalone", environment: "dev", isProduction: false });
