/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Interact composables.
 */

import type { DragEvent, Interactable, ResizeEvent } from "@interactjs/types";
import interact from "interactjs";
import { Ref, onMounted, onUnmounted, ref, unref } from "vue";
import { LogLevel } from "../../core/error";
import { MaybeRefHTMLElementOrNull } from "../common/utility-types";
import { Store, StoreWord, Stores, useStores } from "./store";

/**
 * Listener for dragging.
 *
 * @param event - Event received
 */
function dragMoveListener({ target, dx, dy }: DragEvent): void {
	// Keep the dragged position in the data-x/data-y attributes
	let x: number = (parseFloat(target.getAttribute("data-x") as string) || 0) + dx;
	let y: number = (parseFloat(target.getAttribute("data-y") as string) || 0) + dy;

	// Translate the element
	target.style.transform = `translate(${x}px, ${y}px)`;

	// Update the position attributes
	target.setAttribute("data-x", x.toString());
	target.setAttribute("data-y", y.toString());
}

/**
 * Listener for resizing.
 *
 * @param event - Event received
 */
function resizeMoveListener({ target, rect, deltaRect }: ResizeEvent): void {
	let dataX: string | null = target.getAttribute("data-x");
	let dataY: string | null = target.getAttribute("data-y");
	let x: number = dataX ? parseFloat(dataX) : 0;
	let y: number = dataY ? parseFloat(dataY) : 0;

	// update the element's style
	target.style.width = `${rect.width}px`;
	target.style.height = `${rect.height}px`;

	// translate when resizing from top or left edges
	if (deltaRect) {
		x += deltaRect.left;
		y += deltaRect.top;
	}

	target.style.transform = `translate(${x}px,${y}px)`;

	target.setAttribute("data-x", x.toString());
	target.setAttribute("data-y", y.toString());
}

/**
 * Draggable.
 *
 * @remarks
 * Modifies global state, should not be used twice on same element.
 * There is an underlying library bug, and cannot be in container with `flex-direction: column-reverse`.
 *
 * @param param - Destructured parameter
 * @returns Control refs, draggable and resizable booleans with interchangeable toggle functions
 */
// Infer type
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDraggable({
	element,
	handle,
	resizeCallback,
	resizeMargin: margin
}: {
	/**
	 * Element.
	 */
	element: MaybeRefHTMLElementOrNull;

	/**
	 * Optional handle, if not given, element is used.
	 */
	handle?: MaybeRefHTMLElementOrNull;

	/**
	 * Resize callback.
	 */
	resizeCallback?: () => void;

	/**
	 * Resize hitbox.
	 */
	resizeMargin?: number;
}) {
	const stores: Stores = useStores();
	const { universe }: Store<StoreWord.Universe> = stores.useUniverseStore();

	// Prep refs
	let elementUnref: HTMLElement | null = null;
	let handleUnref: HTMLElement | null = null;

	// Vars
	let interactHandler: Interactable | null = null as Interactable | null;
	let isDraggable: Ref<boolean> = ref<boolean>(true);
	let isResizable: Ref<boolean> = ref<boolean>(true);

	/**
	 * Toggles drag on/off.
	 */
	function toggleDrag(): void {
		isDraggable.value = !isDraggable.value;
		if (interactHandler) {
			interactHandler.draggable(isDraggable.value);
		}
	}

	/**
	 * Toggles resize on/off.
	 */
	function toggleResize(): void {
		isResizable.value = !isResizable.value;
		if (interactHandler) {
			interactHandler.resizable(isResizable.value);
		}
	}

	/**
	 * Deregister interact DOM.
	 */
	function unsetInteract(): void {
		if (interactHandler) {
			interactHandler.unset();
		} else {
			universe.log({
				error: new Error(`Failed to deregister draggable(typeof interactHandler="${typeof interactHandler}")`),
				level: LogLevel.Warning
			});
		}
	}

	onMounted(() => {
		// Init refs
		elementUnref = unref(element);
		handleUnref = handle ? unref(handle) : elementUnref;

		if (elementUnref && handleUnref) {
			interactHandler = interact(elementUnref);

			// Set draggable
			interactHandler
				.resizable({
					edges: { bottom: true, left: true, right: true, top: true },

					enabled: true,

					listeners: {
						/**
						 * Processes resize event.
						 *
						 * @param param - Resize event received
						 */
						move(param: ResizeEvent) {
							resizeMoveListener(param);
							if (resizeCallback) {
								resizeCallback();
							}
						}
					},

					margin,

					modifiers: []
				})
				.draggable({
					allowFrom: handleUnref,

					// Start pinned or not
					enabled: isDraggable.value,

					listeners: {
						// Call this function on every drag move event
						move: dragMoveListener
					},

					// Keep the element within the area of it's parent
					modifiers: [
						interact.modifiers.restrictRect({
							endOnly: true
						})
					]
				});
		}
	});

	onUnmounted(() => {
		unsetInteract();
	});

	return { isDraggable, isResizable, toggleDrag, toggleResize };
}
