/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Vue module augmentation
 */

/**
 * Required for compilation.
 */
declare module "*.vue" {
	import { DefineComponent } from "vue";

	const component: DefineComponent;
	export default component;
}
