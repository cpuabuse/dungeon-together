/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

import { Vector } from "../common/vector";

/**
 * @file Navigation
 */

/**
 *
 */
const tritShiftAmount: number = 3;

/**
 *
 */
const xTritBase: number = 0x1;

/**
 *
 */
const yTritBase: number = 0x1 << tritShiftAmount;

/**
 *
 */
// Manually setting the value
// eslint-disable-next-line no-magic-numbers
const zTritBase: number = 0x1 << (tritShiftAmount * 2);

/**
 *
 */
const tritCoordinateDecrease: number = 1;

/**
 *
 */
const tritCoordinateIncrease: number = 2;

/**
 * Human understandable cell navigation.
 */
export enum Nav {
	/**
	 * Left movement.
	 */
	Left = xTritBase << tritCoordinateDecrease,

	/**
	 * Right movement.
	 */
	Right = xTritBase << tritCoordinateIncrease,

	/**
	 * Up movement.
	 */
	YUp = yTritBase << tritCoordinateDecrease,

	/**
	 * Down movement.
	 */
	YDown = yTritBase << tritCoordinateIncrease,

	/**
	 * Vertical down movement.
	 */
	ZDown = zTritBase << tritCoordinateDecrease,

	/**
	 * Vertical up movement.
	 */
	ZUp = zTritBase << tritCoordinateIncrease,

	/**
	 * Down-left movement.
	 */
	YDownLeft = Nav.YDown | Nav.Left,

	/**
	 * Down-right movement.
	 */
	YDownRight = Nav.YDown | Nav.Right,

	/**
	 * Up-left movement.
	 */
	YUpLeft = Nav.YUp | Nav.Left,

	/**
	 * Up-right movement.
	 */
	YUpRight = Nav.YUp | Nav.Right,

	/**
	 * zDown-bottom movement.
	 */
	ZDownYDown = Nav.ZDown | Nav.YDown,

	/**
	 * zDown-bottom-left movement.
	 */
	ZDownYDownLeft = Nav.ZDown | Nav.YDown | Nav.Left,

	/**
	 * zDown-bottom-right movement.
	 */
	ZDownYDownRight = Nav.ZDown | Nav.YDown | Nav.Right,

	/**
	 * zDown-left movement.
	 */
	ZDownLeft = Nav.ZDown | Nav.Left,

	/**
	 * zDown-right movement.
	 */
	ZDownRight = Nav.ZDown | Nav.Right,

	/**
	 * zDown-top movement.
	 */
	ZDownYUp = Nav.ZDown | Nav.YUp,

	/**
	 * zDown-left movement.
	 */
	ZDownYUpLeft = Nav.ZDown | Nav.YUp | Nav.Left,

	/**
	 * zDown-top-right movement.
	 */
	ZDownYUpRight = Nav.ZDown | Nav.YUp | Nav.Right,

	/**
	 * zUp-bottom-left movement.
	 */
	ZUpYDownLeft = Nav.ZUp | Nav.YDown | Nav.Left,

	/**
	 * zUp-bottom-right movement.
	 */
	ZUpYDownRight = Nav.ZUp | Nav.YDown | Nav.Right,

	/**
	 * zUp-left movement.
	 */
	ZUpLeft = Nav.ZUp | Nav.Left,

	/**
	 * zUp-right movement.
	 */
	ZUpRight = Nav.ZUp | Nav.Right,

	/**
	 * zUp-top movement.
	 */
	ZUpYUp = Nav.ZUp | Nav.YUp,

	/**
	 * zUp-left movement.
	 */
	ZUpYUpLeft = Nav.ZUp | Nav.YUp | Nav.Left,

	/**
	 * zUp-right movement.
	 */
	ZUpYUpRight = Nav.ZUp | Nav.YUp | Nav.Right
}

/**
 *
 */
export const navIndex: Map<Nav, Vector> = new Map(
	// Typescript inserts string as union as return value of "values", unnecessarily
	(Object.values(Nav) as Array<Nav>).map(direction => [
		direction,
		{
			x: 0,
			y: 0,
			z: 0
		}
	])
);
