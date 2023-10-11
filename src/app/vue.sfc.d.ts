/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vue module augmentation for SFC.
 *
 * @file
 */

/**
 * Required for compilation.
 *
 * @remarks
 * Might not be needed, but ESLint still might need this to work well.
 */
declare module "*.vue" {
	import { DefineComponent } from "vue";

	const component: DefineComponent;
	export default component;
}
