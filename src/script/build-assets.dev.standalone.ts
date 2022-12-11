/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Builds assets.
 */

import { main } from "./build-assets.base";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main({ build: "standalone", environment: "dev" });
