/*
	Copyright 2020 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { clientTest } from "./client/test";
import { serverTest } from "./server/test";

// Calling all tests
clientTest();
serverTest();
