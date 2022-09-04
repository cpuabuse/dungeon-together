/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Builds assets.
 *
 * @file
 */

// Build script
/* eslint-disable import/no-extraneous-dependencies */
import mkdirp from "mkdirp";
import ncp from "ncp";
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Path to assets.
 */
const assetPath: string = "include/dungeon-together-assets/build";

/**
 * Compiled asset folder.
 */
const compiledAssetPath: string = "build/stage/standalone";

/**
 * Relative sound path.
 */
const soundPath: string = "sound";

/**
 * Relative sound path.
 */
const imagePath: string = "img";

/**
 * Entrypoint.
 */
async function main(): Promise<void> {
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

	await Promise.all(
		[
			"dungeontileset-ii/chest_full_open_anim_f0.png",
			"dungeontileset-ii/floor_spikes_anim_f0.png",
			"dungeontileset-ii/doors_leaf_closed.png",
			"dungeontileset-ii/floor_1.png",
			"dungeontileset-ii/floor_ladder.png",
			"rltiles/dc-dngn/wall/brick_brown2.bmp",
			"rltiles/dc-mon64/balrug.bmp",
			"rltiles/player/base/human_m.bmp"
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
}

// Call main
// Async entrypoint
// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
