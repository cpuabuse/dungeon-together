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
import { writeFile } from "node:fs";
import { join } from "node:path";
import { parse } from "https://deno.land/std/flags/mod.ts";
import jimp from "npm:jimp@0";
import { mkdirp } from "npm:mkdirp@3";
// @deno-types="npm:@types/ncp@2"
import ncp from "npm:ncp@2";

/** CLI parameters. */
// Infer type
// eslint-disable-next-line @typescript-eslint/typedef
const { environment, build, rootDir } = parse<{ [Key in string]?: string }>(Deno.args);

if (environment && build && rootDir) {
	/**
	 * Path to assets.
	 */
	const assetPath: string = join(rootDir, "include", "dungeon-together-assets", "build");

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

	/** Compiled asset folder. */
	const compiledAssetPath: string = join(rootDir, "build", environment, `${build}-public`);

	await mkdirp(join(compiledAssetPath, soundPath));

	const data: Promise<void> = new Promise((resolve, reject) => {
		ncp("data", join(compiledAssetPath, "data"), err => {
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
					ncp(`${assetPath}/${soundPath}/${folder}`, join(compiledAssetPath, soundPath, folder), err => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				})
		)
	);

	await mkdirp(join(compiledAssetPath, imagePath));
	await mkdirp(join(compiledAssetPath, imagePath, "dungeontileset-ii"));
	await mkdirp(join(compiledAssetPath, imagePath, "rltiles/dc-dngn/wall"));
	await mkdirp(join(compiledAssetPath, imagePath, "rltiles/dc-mon64"));
	await mkdirp(join(compiledAssetPath, imagePath, "rltiles/player/base"));
	await mkdirp(join(compiledAssetPath, imagePath, "rltiles/nh-mon1/w"));

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
					ncp(`${assetPath}/${imagePath}/${file}`, join(compiledAssetPath, imagePath, file), err => {
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
							image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (...[, , idx]) {
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
									writeFile(join(compiledAssetPath, imagePath, `${file}.png`), outputBuffer, err => {
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
} else {
	throw new Error("Parameters are missing.");
}
