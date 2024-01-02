/*
	Copyright 2024 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file
 * Interact composables.
 */

import type { DragEvent, Interactable, ResizeEvent } from "@interactjs/types";
import { useResizeObserver } from "@vueuse/core";
import interact from "interactjs";
import {
	ComputedRef,
	Ref,
	ShallowRef,
	computed,
	isRef,
	nextTick,
	onMounted,
	onUnmounted,
	ref,
	unref,
	watch,
	watchEffect
} from "vue";
import { LogLevel } from "../../core/error";
import { ElementVector } from "../common/element";
import { MaybeRefHTMLElementOrNull } from "../common/utility-types";
import { Store, StoreWord, Stores, useStores } from "./store";

/**
 * Draggable.
 *
 * @remarks
 * Modifies global state, should not be used twice on same element.
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
	resizeMargin: margin,
	ancestorElement,
	initialSize = { x: 300, y: 500 },
	initialPositionRatio = { x: 0.5, y: 0.5 }
}: {
	/**
	 * Element to contain the child in, not necessarily direct parent.
	 *
	 * @remarks
	 * - Receives desired ancestor, instead of figuring out `offsetParent`, as there is no way to reactively retrieve it. This also means, that there should be no positioned element in between component and ancestor, as absolute position would be relative to it.
	 * - Element should not have "transform", "width", "height", "left", "top" inline styles set, as they will be modified.
	 * - Axis based refs are stored independently, since their mutations are independent.
	 * - Using cartesian coodinates. CSS' left is x, top is y. Axis direction always assumed LTR.
	 * CSS "transform" is used for performance, it is much faster than position.
	 */
	ancestorElement: MaybeRefHTMLElementOrNull;

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

	/**
	 * Initial size.
	 */
	initialSize?: ElementVector;

	/**
	 * Initial position as a fraction of ancestor size.
	 */
	initialPositionRatio?: ElementVector;
}) {
	// Stores
	const stores: Stores = useStores();
	const universeStore: Store<StoreWord.Universe> = stores.useUniverseStore();

	// Track dimensions
	const width: Ref<number> = ref(initialSize.x);
	const height: Ref<number> = ref(initialSize.y);

	// Track position
	const x: ShallowRef<number> = ref(0);
	const y: ShallowRef<number> = ref(0);

	// Styles
	const widthStyle: ComputedRef<string> = computed(() => {
		return `${width.value}px`;
	});
	const heightStyle: ComputedRef<string> = computed(() => {
		return `${height.value}px`;
	});
	const transformStyle: ComputedRef<string> = computed(() => {
		return `translate(${x.value}px, ${y.value}px)`;
	});

	// Update styles
	watchEffect(() => {
		unref(element)?.style.setProperty("transform", transformStyle.value);
	});
	watchEffect(() => {
		unref(element)?.style.setProperty("width", widthStyle.value);
	});
	watchEffect(() => {
		unref(element)?.style.setProperty("height", heightStyle.value);
	});
	watchEffect(() => {
		unref(element)?.style.setProperty("left", "0px");
	});
	watchEffect(() => {
		unref(element)?.style.setProperty("top", "0px");
	});
	if (isRef(element)) {
		watch(element, (value, oldValue) => {
			if (oldValue) {
				["transform", "width", "height", "left", "top"].forEach((style: string) => {
					oldValue.style.removeProperty(style);
				});
			}
		});
	}

	/*
		Track ancestor dimensions, since this operation is rare, extra logic is added, to not impact normal interact events.
		`useResizeObserver` is immediate, but only run when ancestor element is rendered. Which guarantees no redundant runs, and initial tracked values update. Also, library source code suggest that the observer would be updated and run on change of ancestor element ref.
		Size and position are manipulated outside of observer/watcher, so observer tracks that, to identify if stored percentage position is still accurate.
		Watcher will initialize initial ratio position.
	*/
	const ancestorWidth: Ref<number> = ref<number>(0);
	const ancestorHeight: Ref<number> = ref<number>(0);
	// ESLint fails inference
	// eslint-disable-next-line @typescript-eslint/typedef
	useResizeObserver(ancestorElement, ([event]) => {
		if (event) {
			ancestorWidth.value = event.contentRect.width;
			ancestorHeight.value = event.contentRect.height;
		}
	});
	(
		[
			{ axis: "x", position: x, size: width, target: ancestorWidth },
			{ axis: "y", position: y, size: height, target: ancestorHeight }
		] as const
	)
		// ESLint fails inference
		// eslint-disable-next-line @typescript-eslint/typedef
		.forEach(({ target, size, position, axis }) => {
			let lastPosition: number = position.value;
			let lastPositionRatio: number = initialPositionRatio[axis];
			let lastSize: number = size.value;
			watch(target, (newAncestorSizeUnref, oldAncestorSizeUnref) => {
				// If any of the values changed outside of observer/watcher, recalculate percentage
				if (!(size.value === lastSize && position.value === lastPosition)) {
					// Recalculate percentage; Have to make sure no division by zero
					let divider: number = oldAncestorSizeUnref - size.value;
					if (divider !== 0) {
						lastPositionRatio = position.value / divider;
					}
				}
				// Update coordinates
				let newPosition: number = lastPositionRatio * (newAncestorSizeUnref - size.value);
				position.value = newPosition;
				lastPosition = newPosition;
			});
		});

	// Interact vars
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
		}
	}

	// Interact mounted
	onMounted(async () => {
		// Next tick is called to ensure that the elements are rendered and can extract element properties
		await nextTick(() => {
			// Restriction, defaults to body
			const restriction: ComputedRef<HTMLElement> = computed(() => {
				return unref(ancestorElement) ?? document.body;
			});

			// Resizable default options, used for reinitialization of interact
			const resizableRestrictModifier: ReturnType<typeof interact.modifiers.restrictEdges> =
				interact.modifiers.restrictEdges();
			watchEffect(() => {
				resizableRestrictModifier.options.outer = restriction.value;
			});
			const resizableOptions: Parameters<Interactable["resizable"]>[0] = {
				edges: { bottom: true, left: true, right: true, top: true },
				listeners: {
					/**
					 * Listener for resizing.
					 *
					 * @param event - Event received
					 */
					move({ deltaRect }: ResizeEvent): void {
						// Update the element's style
						if (deltaRect) {
							width.value += deltaRect.width;
							height.value += deltaRect.height;
							x.value += deltaRect.left;
							y.value += deltaRect.top;
						}

						// Call callback
						if (resizeCallback) {
							resizeCallback();
						}
					}
				},
				margin,
				modifiers: [resizableRestrictModifier]
			};
			watchEffect(() => {
				resizableOptions.enabled = isResizable.value;
			});

			// Draggable default options, used for reinitialization of interact
			const draggableRestrictModifier: ReturnType<typeof interact.modifiers.restrictRect> =
				interact.modifiers.restrictRect();
			watchEffect(() => {
				draggableRestrictModifier.options.restriction = restriction.value;
			});
			const draggableOptions: Parameters<Interactable["draggable"]>[0] = {
				listeners: {
					// Call this function on every drag move event
					/**
					 * Listener for dragging.
					 *
					 * @param event - Event received
					 */
					move({ dx, dy }: DragEvent): void {
						x.value += dx;
						y.value += dy;
					}
				},
				modifiers: [draggableRestrictModifier]
			};
			watchEffect(() => {
				draggableOptions.enabled = isDraggable.value;
			});

			/*
				Watch effect is chosen over watch, as there are optional maybe refs, so typing would be messy, and extra logic would need to be added.
				Watch effect runs immediately.
				Callback is chunky, so need to be extra careful with unreleated dereferences within it.
			*/
			watchEffect(() => {
				// Init refs; These should be the only dereferences within this function
				const elementUnref: HTMLElement | null = unref(element);
				let handleUnref: HTMLElement | null = unref(handle) ?? elementUnref;

				if (elementUnref && handleUnref) {
					// Firstly, reset
					unsetInteract();
					interactHandler = interact(elementUnref);

					// Set draggable
					interactHandler
						// Note: Inertia doesn't work well with resize
						.resizable(resizableOptions)
						.draggable({
							...draggableOptions,
							allowFrom: handleUnref
						});
				} else {
					// Log error
					universeStore.universe.log({
						error: new Error(`Could not dereference HTML elements for interact`),
						level: LogLevel.Warning
					});
				}
			});
		});
	});

	// Unmounted
	onUnmounted(() => {
		unsetInteract();
	});

	return { isDraggable, isResizable, toggleDrag, toggleResize, transform: transformStyle };
}
