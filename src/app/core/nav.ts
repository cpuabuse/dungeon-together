/*
	Copyright 2021 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Navigation
 *
 * Ways to address, encode and decode navigation identifiers for adjacent cells.
 *
 * In a binary number, each digit will be reserved for a direction of particular coordinate change. While the absence of both will be represented by zero. Thus, there are three possible states per direction, per trit.
 * For the purposes of simplicity when defining values of potential direction combinations, this way of representation was chosen, so that `leftTop == left | top` is true. So there are two bits(digits) per trit.
 */

import { Vector } from "../common/vector";

/**
 * Amount of bits reserved per coordinates.
 */
const tritShiftAmount: number = 2;

/**
 * A single bit, representing increase or decrease in coordinate.
 */
const coordinateBorder: number = 0x1;

/**
 * Keys of {@link Vector}.
 */
enum VectorDimensions {
	X = "x",
	Y = "y",
	Z = "z"
}

/**
 * Amount of bits needed for coordinate border to be shifted left, so that dimension specific border is produced.
 */
enum TritCoordinateShiftAmounts {
	Increase = 1,
	Decrease = 0
}

/**
 * Representation of change in coordinate encoded in a trit.
 */
enum CoordinateChanges {
	Decrease = -1,
	Neutral = 0,
	Increase = 1
}

/**
 * A type for a main object containing encoding and decoding information, for conversion between navigation values and coordinate change.
 */
type VectorCodecInfo = {
	[K in VectorDimensions]: {
		/**
		 * Mask required to extract dimension trit.
		 */
		mask: number;

		/**
		 * Shift required to produce dimension trit border.
		 */
		shift: {
			[C in TritCoordinateShiftAmounts]: number;
		};

		/**
		 * Decoded coordinate change on masked value.
		 */
		maskedCoordinateChange: Map<number, CoordinateChanges>;
	};
};

/**
 * Main object containing all necessary information for conversion between navigation and corresponding coordinate change.
 */
const vectorCodecInfo: VectorCodecInfo = (function ({
	dimensions
}: {
	/**
	 * Dimensions to be generated.
	 */
	dimensions: Set<VectorDimensions>;
}): VectorCodecInfo {
	return Array.from(dimensions).reduce((info, dimensionKey, index) => {
		// Initial variables
		let border: number = coordinateBorder << (tritShiftAmount * index);
		let decreaseBit: number = border << TritCoordinateShiftAmounts.Decrease;
		let increaseBit: number = border << TritCoordinateShiftAmounts.Increase;

		// Empty mask
		let mask: number = 0x0;

		// Populate mask
		for (let i: number = 0; i < tritShiftAmount; i++) {
			mask |= border << i;
		}

		// Separate variable for explicit type check
		let dimensionValue: VectorCodecInfo[VectorDimensions] = {
			mask,
			maskedCoordinateChange: new Map([
				[decreaseBit, CoordinateChanges.Decrease],
				// "0x0" represents neutral value
				[0x0, CoordinateChanges.Neutral],
				[increaseBit, CoordinateChanges.Increase]
			]),
			shift: {
				[TritCoordinateShiftAmounts.Decrease]: decreaseBit,
				[TritCoordinateShiftAmounts.Increase]: increaseBit
			}
		};

		return {
			...info,
			[dimensionKey]: dimensionValue
		};
	}, {} as VectorCodecInfo);
})({
	dimensions: new Set(Object.values(VectorDimensions))
});

/**
 * Unconditionally produces value responsible for specific change in a specific dimension.
 *
 * @returns Dimension bit
 */
function getDimensionBit({
	dimensionKey,
	shiftAmount
}: {
	/**
	 * A key to be used to access a dimension in codec.
	 */
	dimensionKey: VectorDimensions;

	/**
	 * Shift amount representing direction.
	 */
	shiftAmount: TritCoordinateShiftAmounts;
}): number {
	let dimensionBit: number | undefined = vectorCodecInfo[dimensionKey].maskedCoordinateChange.get(shiftAmount);

	return dimensionBit === undefined ? CoordinateChanges.Neutral : dimensionBit;
}

/**
 * Human understandable cell navigation.
 */
export enum Nav {
	/**
	 * Left movement.
	 */
	Left = getDimensionBit({
		dimensionKey: VectorDimensions.X,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Right movement.
	 */
	Right = getDimensionBit({
		dimensionKey: VectorDimensions.X,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	}),

	/**
	 * Up movement.
	 */
	YUp = getDimensionBit({
		dimensionKey: VectorDimensions.Y,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Down movement.
	 */
	YDown = getDimensionBit({
		dimensionKey: VectorDimensions.Y,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	}),

	/**
	 * Vertical down movement.
	 */
	ZUp = getDimensionBit({
		dimensionKey: VectorDimensions.Z,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Vertical up movement.
	 */
	ZDown = getDimensionBit({
		dimensionKey: VectorDimensions.Z,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	}),

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
 * A value type to which {@link navIndex} maps to.
 * Also acts as a constraint for compatibility with {@link Vector}.
 */
type NavIndexValue = Vector extends {
	[K in VectorDimensions]: CoordinateChanges;
}
	? {
			[K in VectorDimensions]: CoordinateChanges;
	  }
	: never;

/**
 * Index representing relationship between {@link Nav} and {@link Vector} coordinate change.
 */
export const navIndex: Map<
	Nav,
	// A constraint making sure return value is compatible with vector
	NavIndexValue
> = new Map(
	// Typescript inserts string as union as return value of "values", unnecessarily
	(Object.values(Nav) as Array<Nav>).map(nav => [
		nav,
		Object.values(VectorDimensions).reduce((result, dimension) => {
			// Explicitly verifying type
			let dimensionValue: NavIndexValue[VectorDimensions] | undefined = vectorCodecInfo[
				dimension
			].maskedCoordinateChange.get(nav & vectorCodecInfo[dimension].mask);

			return {
				...result,
				[dimension]: dimensionValue === undefined ? CoordinateChanges.Neutral : dimensionValue
			};
		}, {} as NavIndexValue)
	])
);
