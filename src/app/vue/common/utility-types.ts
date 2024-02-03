/*
	Copyright 2023 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Vue utility types.
 *
 * @file
 */

import { AllowedComponentProps, Component, ExtractDefaultPropTypes, ExtractPropTypes, Ref, VNodeProps } from "vue";

import { ConcreteConstructorConstraint } from "../../common/utility-types";

/**
 * Maybe ref.
 */
export type MaybeRef<T> = T | Ref<T>;

/**
 * Maybe ref of div or null.
 */
export type MaybeRefHTMLDivElementOrNull = MaybeRef<HTMLDivElement | null>;

/**
 * Maybe ref of {@link HTMLElement} or null.
 */
export type MaybeRefHTMLElementOrNull = MaybeRef<HTMLElement | null>;

/**
 * Extracts props from component class.
 */
export type ExtractPropsFromComponentClass<ComponentClass extends Component> =
	ComponentClass extends ConcreteConstructorConstraint
		? Omit<InstanceType<ComponentClass>["$props"], keyof VNodeProps | keyof AllowedComponentProps>
		: never;

/**
 * Extracts props from prop object, making ones that has default, optional.
 */
export type ExtractProps<O> = Partial<ExtractDefaultPropTypes<O>> &
	Omit<ExtractPropTypes<O>, keyof ExtractDefaultPropTypes<O>>;

/**
 * Type for setup context emit.
 */
export type SetupContextEmit<Event extends string = string> = (event: Event, ...args: any[]) => void;
