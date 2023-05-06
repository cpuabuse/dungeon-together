/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Builds assets.
 *
 * @file
 */

// Build script
/* eslint-disable import/no-extraneous-dependencies */
import { writeFile } from "fs";
import jimp from "jimp";
import mkdirp from "mkdirp";
import ncp from "ncp";
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Path to assets.
 */
const assetPath: string = "include/dungeon-together-assets/build";

/**
 * Relative sound path.
 */
const soundPath: string = "sound";

/**
 * Relative sound path.
 */
const imagePath: string = "img";

/**
 * Color to replace.
 */
// Infer and declare
// eslint-disable-next-line @typescript-eslint/typedef, no-magic-numbers
const replaceColor = [0x47, 0x6c, 0x6c] as const;

/**
 * Entrypoint.
 *
 * @param param - Destructured parameter
 */
export async function main({
	environment,
	build
}: {
	/**
	 * Environment name.
	 */
	environment: string;

	/**
	 * Build name.
	 */
	build: string;
}): Promise<void> {
	/** Compiled asset folder. */
	const compiledAssetPath: string = `build/${environment}/${build}`;

	await mkdirp(`${compiledAssetPath}/${soundPath}`);

	let data: Promise<void> = new Promise((resolve, reject) => {
		ncp("data", `${compiledAssetPath}/data`, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
	await data;

	await Promise.all(
		["amaranta-music", "effects", "lexin-music"].map(
			folder =>
				new Promise<void>((resolve, reject) => {
					ncp(`${assetPath}/${soundPath}/${folder}`, `${compiledAssetPath}/${soundPath}/${folder}`, err => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				})
		)
	);

	await mkdirp(`${compiledAssetPath}/${imagePath}`);
	await mkdirp(`${compiledAssetPath}/${imagePath}/dungeontileset-ii`);
	await mkdirp(`${compiledAssetPath}/${imagePath}/rltiles/dc-dngn/wall`);
	await mkdirp(`${compiledAssetPath}/${imagePath}/rltiles/dc-mon64`);
	await mkdirp(`${compiledAssetPath}/${imagePath}/rltiles/player/base`);
	await mkdirp(`${compiledAssetPath}/${imagePath}/rltiles/nh-mon1/w`);

	await Promise.all(
		[
			"dungeontileset-ii/chest_full_open_anim_f0.png",
			"dungeontileset-ii/chest_full_open_anim_f2.png",
			"dungeontileset-ii/floor_spikes_anim_f0.png",
			"dungeontileset-ii/floor_spikes_anim_f3.png",
			"dungeontileset-ii/doors_leaf_closed.png",
			"dungeontileset-ii/doors_leaf_open.png",
			"dungeontileset-ii/floor_1.png",
			"dungeontileset-ii/floor_ladder.png"
		].map(
			file =>
				new Promise<void>((resolve, reject) => {
					ncp(`${assetPath}/${imagePath}/${file}`, `${compiledAssetPath}/${imagePath}/${file}`, err => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				})
		)
	);

	await Promise.all(
		[
			"rltiles/dc-dngn/wall/brick_brown2",
			"rltiles/dc-mon64/balrug",
			"rltiles/player/base/human_m",
			"rltiles/nh-mon1/w/wraith"
		].map(
			file =>
				new Promise<void>((resolve, reject) => {
					jimp
						.read(`${assetPath}/${imagePath}/${file}.bmp`)
						.then(image => {
							// False positive
							// eslint-disable-next-line @typescript-eslint/typedef
							image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
								if (replaceColor.every((color, cIndex) => color === this.bitmap.data[idx + cIndex])) {
									this.bitmap.data[idx + replaceColor.length] = 0x00;
								}
							});

							// False positive
							// eslint-disable-next-line @typescript-eslint/typedef
							image.getBuffer(jimp.MIME_PNG, function (bufferErr, outputBuffer) {
								if (bufferErr) {
									reject(bufferErr);
								} else {
									writeFile(`${compiledAssetPath}/${imagePath}/${file}.png`, outputBuffer, err => {
										if (err) {
											reject(err);
										} else {
											resolve();
										}
									});
								}
							});
						})
						.catch(err => {
							reject(err);
						});
				})
		)
	);
}
