/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * SVGs.
 *
 * @file
 */

import { AbstractElement as FaElement, icon as faIcon } from "@fortawesome/fontawesome-svg-core";
import { IconDefinition, faPause } from "@fortawesome/free-solid-svg-icons";
import { CoreLog, LogLevel } from "../core/error";

/**
 * SVG.
 */
export interface SimpleSvg {
	/**
	 * SVG path.
	 */
	d: string;

	/**
	 * SVG view box.
	 */
	viewBox: string;
}

/**
 * FA simple SVG.
 */
class FaSimpleSvg implements SimpleSvg {
	public d: string;

	public viewBox: string;

	/**
	 * Constructor for FA simple SVG.
	 *
	 * @param param - Destructured parameter
	 */
	public constructor({
		icon
	}: {
		/**
		 * Icon definition for FA.
		 */
		icon: IconDefinition;
	}) {
		let abstractIcon: FaElement | undefined = faIcon(icon).abstract[0];
		let d: string | undefined = (
			(abstractIcon?.children ?? [])[0]?.attributes as
				| undefined
				| {
						/**
						 * Actual path.
						 */
						d?: string;
				  }
		)?.d;

		let viewBox: string | undefined = (
			abstractIcon?.attributes as
				| undefined
				| {
						/**
						 * Actual string view box.
						 */
						viewBox?: string;
				  }
		)?.viewBox;

		if (d && viewBox) {
			this.d = d;
			this.viewBox = viewBox;
		} else {
			CoreLog.global.log({
				error: new Error(`Could not create SVG from FA icon(name="${icon.iconName}")`),
				level: LogLevel.Warning
			});
			this.d = "M0 0 L0 1 L1 1 Z";
			this.viewBox = "0 0 1 1";
		}
	}
}

/**
 * Pause icon.
 */
export const pauseSimpleSvg: SimpleSvg = new FaSimpleSvg({ icon: faPause });
