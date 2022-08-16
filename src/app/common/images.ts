/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Images
 */

/**
 * Amount of sprites in bunny.
 */
const bunnySvgSpriteAmount: number = 300;

/**
 * Maximum RGB colors.
 */
const maxRgb: number = 255;

/**
 * SVGs of bunnies.
 */
export const bunnySvgs: Record<string, string> = Array.from(
	{
		length: bunnySvgSpriteAmount
	},
	(spriteElement, spriteIndex) => {
		// `2` is used as half
		/* eslint no-magic-numbers: ["error", { "ignore": [1, 2] }] */
		const colorAmount: number = 3;
		const twoPi: number = Math.PI * 2;
		return Array.from(
			{
				length: colorAmount
			},
			(colorElement, colorIndex) => colorIndex
		).map(phaseShiftMultiplier =>
			Math.min(
				maxRgb,
				Math.round(
					(Math.sin((twoPi * spriteIndex) / bunnySvgSpriteAmount + (twoPi * phaseShiftMultiplier) / colorAmount) / 2 +
						1 / 2) *
						maxRgb
				)
			)
		);
	}
	// False negative
	// eslint-disable-next-line @typescript-eslint/typedef
).reduce((result, [r, g, b]) => {
	return {
		...result,
		[`${r}-${g}-${b}`]: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve" fill="rgb(${r.toString()}, ${g.toString()}, ${b.toString()})"><g><path d="M95.295,51.558c-2.091-4.181-11.101-14.188-15.282-16.877c-0.426-0.274-0.872-0.506-1.326-0.705   c0.778-2.507,1.326-5.43,1.326-8.705c0-11.352-6.572-15.981-6.572-15.981s-6.423,4.928-6.423,16.13   c0,2.979,0.457,5.669,1.124,8.019c-0.736,0.152-1.417,0.354-2.038,0.605c-0.606-2.938-1.751-6.285-3.844-9.643   c-6.006-9.633-14.032-10.086-14.032-10.086s-2.842,7.581,3.084,17.086c2.657,4.262,5.979,7.15,8.837,9.042   c-0.291,0.78-0.504,1.551-0.657,2.268c-5.418-4.074-12.435-6.539-20.104-6.539c-13.007,0-24.141,7.075-28.77,17.109   c-0.641-0.429-1.411-0.68-2.24-0.68c-2.227,0-4.033,1.972-4.033,4.198S6.15,61,8.377,61c0.01,0,0.02,0,0.03,0   c-0.178,1-0.321,1.281-0.415,2.061c0,0-3.291,27.939,8.209,27.939c8.861,0,24.193,0,30.765,0c-0.048-5-8.092-6.541-14.04-6.477   C40.527,81.486,45.9,74.098,45.9,65.413c0-10.853-8.391-19.724-19.039-20.527c0.525-0.041,1.054-0.058,1.589-0.058   c11.383,0,20.611,9.232,20.611,20.616c0,8.684-4.799,15.293-12.399,18.328c5.312-0.057,11.958,1.442,13.349,5.709   c5.507-1.774,10.288-4.957,13.837-8.965L72.993,91h11.948c1.344-7-8.514-6.056-8.514-6.056l-1.045-5.64   c9.856-6.423,7.02-18.057,7.02-18.057C90.02,61.248,97.386,55.741,95.295,51.558z M83.497,50.314c-1.08,0-1.956-0.876-1.956-1.958   s0.876-1.958,1.956-1.958c1.082,0,1.958,0.876,1.958,1.958S84.579,50.314,83.497,50.314z"></path></g></svg>`
	};
}, {});
