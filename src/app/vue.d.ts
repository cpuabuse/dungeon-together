/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vue module augmentation
 */

declare module "*.vue" {
	import { DefineComponent } from "vue";

	const component: DefineComponent;
	export default component;
}
