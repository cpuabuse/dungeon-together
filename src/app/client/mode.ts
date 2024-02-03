/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Definition of modes.
 */

import axios, { AxiosResponse } from "axios";
import { encode as base64Encode, fromUint8Array } from "js-base64";
import { BaseTexture, SVGResource, Texture } from "pixi.js";
import { bunnySvgs, defaultBunnySvg } from "../common/images";
import { UrlPath } from "../common/url";
import { Uuid } from "../common/uuid";

/**
 * Modes for the client.
 */
export class ClientMode {
	// Order is important
	/* eslint-disable @typescript-eslint/member-ordering */
	public static defaultBase64Src: string = `data:image/svg+xml;base64,${base64Encode(defaultBunnySvg)}`;

	public base64Src: string = ClientMode.defaultBase64Src;
	/* eslint-enable @typescript-eslint/member-ordering */

	public static defaultTexture: Texture = new Texture(new BaseTexture(new SVGResource(this.defaultBase64Src)));

	public isInitialized: Promise<void>;

	public modeUuid: Uuid;

	/**
	 * Textures.
	 */
	public textures: Array<Texture> = [ClientMode.defaultTexture];

	/**
	 * Constructor.
	 *
	 * @param param - Destructured parameters; If paths property missing, default bunny will be created
	 */
	public constructor({
		paths,
		modeUuid
	}: {
		/**
		 * Paths.
		 */
		paths?: Array<UrlPath>;

		/**
		 * Mode UUID.
		 */
		modeUuid: Uuid;
	}) {
		/**
		 * Response to Base64.
		 *
		 * @param response - Response from server
		 * @returns - Base64 encoded data URI
		 */
		function responseToBase64({
			response: {
				data,
				headers: { "content-type": contentType }
			}
		}: {
			/**
			 * Response from Axios.
			 */
			response: AxiosResponse<ArrayBuffer>;
		}): string | undefined {
			if (typeof contentType === "string") {
				return `data:${contentType};base64,${fromUint8Array(new Uint8Array(data))}`;
			}
			return undefined;
		}

		this.modeUuid = modeUuid;

		this.isInitialized = (async (): Promise<void> => {
			if (paths) {
				try {
					if (paths.length < 1) {
						throw new Error(
							`No paths provided to instantiate a mode("modeUuid=${
								// Mode UUID is definitively assigned at the beginning of the constructor
								(this as ClientMode).modeUuid
							}").`
						);
					}

					let responses: Array<AxiosResponse<ArrayBuffer>> = await Promise.all(
						paths.map(path => {
							return axios.get<ArrayBuffer>(path, {
								responseType: "arraybuffer"
							});
						})
					);

					this.textures = responses.map(response => {
						return new Texture(
							new BaseTexture(
								responseToBase64({
									response
								})
							)
						);
					});

					let response: AxiosResponse<ArrayBuffer> | undefined = responses[0];
					if (response) {
						const base64Src: string | void = responseToBase64({ response });
						this.base64Src = base64Src ?? ClientMode.defaultBase64Src;
					}
				} catch (error) {
					// TODO: Log the error and initialize with the bunny
				}
			} else {
				// Initialize textures
				const srcList: Array<string> = Object.values(bunnySvgs).map(
					bunny => `data:image/svg+xml;base64,${base64Encode(bunny)}`
				);
				this.textures = srcList.map(
					/*
						Even though the source code can load XML element, `SVGResource` documentation (https://github.com/pixijs/pixijs/blob/fdbdc45b6a95bd47145e3a7267fe2a69a1be4ebb/packages/core/src/textures/resources/SVGResource.ts#L90-L98) states that it accepts Base64 encoded SVG. Which apparently means Base64 data URI, which we will use to adhere to documentation.
					*/
					bunny => new Texture(new BaseTexture(new SVGResource(bunny)))
				);

				// Initialize base source
				const firstSrc: string | undefined = srcList[0];
				if (firstSrc) {
					this.base64Src = firstSrc;
				}
			}
		})();
	}
}
