/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { defineBase } from "./base.vite.config";

/**
 * Vite config for dev standalone.
 *
 * @file
 */

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

export default defineBase({ build: "standalone", environment: "dev", isProduction: false });
