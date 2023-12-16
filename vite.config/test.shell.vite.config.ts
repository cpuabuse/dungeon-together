/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Vite config for test unit.
 */

import { defineBase } from "./base.vite.config";

// This is file for compilation
/* eslint-disable import/no-extraneous-dependencies */

export default defineBase({ build: "shell", environment: "test", isClient: false, isProduction: true, isTest: true });
