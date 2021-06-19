/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vue module augmentation
 */

declare module "*.vue" {
	import { defineComponent } from "vue";

	const component: ReturnType<typeof defineComponent>;
	export default component;
}
