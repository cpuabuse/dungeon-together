/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * @file Navigation
 *
 * Ways to address, encode and decode navigation identifiers for adjacent cells.
 *
 * In a binary number, each digit will be reserved for a direction of particular coordinate change. While the absence of both will be represented by zero. Thus, there are three possible states per direction, per trit.
 * For the purposes of simplicity when defining values of potential direction combinations, this way of representation was chosen, so that `leftTop == left] | top` is true. So there are two bits(digits) per trit.
 */

import { Vector } from "../../common/vector";
import { CoreArgIds } from "./arg";
import { CoreArgOptionsWithMapUnion } from "./map";
import { CoreArgOptionIds, CoreArgOptionsUnionGenerate } from "./options";
import { CoreArgPathReduced } from "./path";

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
 * Union of options with nav.
 */
export type CoreArgOptionsWithNavUnion = CoreArgOptionsUnionGenerate<CoreArgOptionIds.Nav>;

/**
 * Union of options with nav.
 */
export type CoreArgOptionsWithoutNavUnion = CoreArgOptionsUnionGenerate<never, CoreArgOptionIds.Nav>;

/**
 * Nav for arg.
 */
export type CoreArgNav<
	Id extends CoreArgIds,
	Options extends CoreArgOptionsWithNavUnion,
	ParentIds extends CoreArgIds = never
> = Options extends CoreArgOptionsWithMapUnion
	? {
			/**
			 * Nav.
			 */
			nav: Map<Nav, CoreArgPathReduced<Id, Options, ParentIds>>;
	  }
	: {
			/**
			 * Nav.
			 */
			nav?: {
				[K in Nav]?: CoreArgPathReduced<Id, Options, ParentIds>;
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
 * @param param - Destructured param
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
	let dimensionBit: number | undefined = vectorCodecInfo[dimensionKey].shift[shiftAmount];

	return dimensionBit === undefined ? CoordinateChanges.Neutral : dimensionBit;
}

/**
 * Temp placeholder.
 */
export enum Nav {
	/**
	 * Left movement.
	 */
	Left = "left",

	/**
	 * Right movement.
	 */
	Right = "right",

	/**
	 * Up movement.
	 */
	YUp = "y-up",

	/**
	 * Down movement.
	 */
	YDown = "y-down",

	/**
	 * Vertical up movement.
	 */
	ZUp = "z-up",

	/**
	 * Vertical down movement.
	 */
	ZDown = "z-down",

	/**
	 * "Down-left" movement.
	 */
	YDownLeft = "y-down-left",

	/**
	 * "Down-right" movement.
	 */
	YDownRight = "y-down-right",

	/**
	 * "Up-left" movement.
	 */
	YUpLeft = "y-up-left",

	/**
	 * "Up-right" movement.
	 */
	YUpRight = "y-up-right",

	/**
	 * "zDown-bottom" movement.
	 */
	ZDownYDown = "z-down-y-down",

	/**
	 * "zDown-bottom-left" movement.
	 */
	ZDownYDownLeft = "z-down-y-down-left",

	/**
	 * "zDown-bottom-right" movement.
	 */
	ZDownYDownRight = "z-down-y-down-right",

	/**
	 * "zDown-left" movement.
	 */
	ZDownLeft = "z-down-left",

	/**
	 * "zDown-right" movement.
	 */
	ZDownRight = "z-down-right",

	/**
	 * "zDown-top" movement.
	 */
	ZDownYUp = "z-down-y-up",

	/**
	 * "zDown-left" movement.
	 */
	ZDownYUpLeft = "z-down-y-up-left",

	/**
	 * "zDown-top-right" movement.
	 */
	ZDownYUpRight = "z-down-y-up-right",

	/**
	 * "zUp-bottom-left" movement.
	 */
	ZUpYDownLeft = "z-up-y-down-left",

	/**
	 * "zUp-bottom-right" movement.
	 */
	ZUpYDownRight = "z-up-y-down-right",

	/**
	 * "zUp-left" movement.
	 */
	ZUpLeft = "z-up-left",

	/**
	 * "zUp-right" movement.
	 */
	ZUpRight = "z-up-right",

	/**
	 * "zUp-top" movement.
	 */
	ZUpYUp = "z-up-y-up",

	/**
	 * "zUp-left" movement.
	 */
	ZUpYUpLeft = "z-up-y-up-left",

	/**
	 * "zUp-right" movement.
	 */
	ZUpYUpRight = "z-up-y-up-right"
}

/**
 * Static part of nav.
 */
// eslint-disable-next-line @typescript-eslint/typedef
const staticNav = {
	/**
	 * Left movement.
	 */
	[Nav.Left]: getDimensionBit({
		dimensionKey: VectorDimensions.X,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Right movement.
	 */
	[Nav.Right]: getDimensionBit({
		dimensionKey: VectorDimensions.X,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	}),

	/**
	 * Up movement.
	 */
	[Nav.YUp]: getDimensionBit({
		dimensionKey: VectorDimensions.Y,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Down movement.
	 */
	[Nav.YDown]: getDimensionBit({
		dimensionKey: VectorDimensions.Y,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	}),

	/**
	 * Vertical up movement.
	 */
	[Nav.ZUp]: getDimensionBit({
		dimensionKey: VectorDimensions.Z,
		shiftAmount: TritCoordinateShiftAmounts.Decrease
	}),

	/**
	 * Vertical down movement.
	 */
	[Nav.ZDown]: getDimensionBit({
		dimensionKey: VectorDimensions.Z,
		shiftAmount: TritCoordinateShiftAmounts.Increase
	})
};

/**
 * Human understandable cell navigation.
 *
 * For z coordinate, the highest point from the perspective of the user(e.g. the sky) is zero.
 * So the descent from the perspective of the user, is an increase in z coordinate.
 */
const nav: { [K in Nav]: number } = {
	...staticNav,

	/**
	 * "Down-left" movement.
	 */
	[Nav.YDownLeft]: staticNav[Nav.YDown] | staticNav[Nav.Left],

	/**
	 * "Down-right" movement.
	 */
	[Nav.YDownRight]: staticNav[Nav.YDown] | staticNav[Nav.Right],

	/**
	 * "Up-left" movement.
	 */
	[Nav.YUpLeft]: staticNav[Nav.YUp] | staticNav[Nav.Left],

	/**
	 * "Up-right" movement.
	 */
	[Nav.YUpRight]: staticNav[Nav.YUp] | staticNav[Nav.Right],

	/**
	 * "zDown-bottom" movement.
	 */
	[Nav.ZDownYDown]: staticNav[Nav.ZDown] | staticNav[Nav.YDown],

	/**
	 * "zDown-bottom-left" movement.
	 */
	[Nav.ZDownYDownLeft]: staticNav[Nav.ZDown] | staticNav[Nav.YDown] | staticNav[Nav.Left],

	/**
	 * "zDown-bottom-right" movement.
	 */
	[Nav.ZDownYDownRight]: staticNav[Nav.ZDown] | staticNav[Nav.YDown] | staticNav[Nav.Right],

	/**
	 * "zDown-left" movement.
	 */
	[Nav.ZDownLeft]: staticNav[Nav.ZDown] | staticNav[Nav.Left],

	/**
	 * "zDown-right" movement.
	 */
	[Nav.ZDownRight]: staticNav[Nav.ZDown] | staticNav[Nav.Right],

	/**
	 * "zDown-top" movement.
	 */
	[Nav.ZDownYUp]: staticNav[Nav.ZDown] | staticNav[Nav.YUp],

	/**
	 * "zDown-left" movement.
	 */
	[Nav.ZDownYUpLeft]: staticNav[Nav.ZDown] | staticNav[Nav.YUp] | staticNav[Nav.Left],

	/**
	 * "zDown-top-right" movement.
	 */
	[Nav.ZDownYUpRight]: staticNav[Nav.ZDown] | staticNav[Nav.YUp] | staticNav[Nav.Right],

	/**
	 * "zUp-bottom-left" movement.
	 */
	[Nav.ZUpYDownLeft]: staticNav[Nav.ZUp] | staticNav[Nav.YDown] | staticNav[Nav.Left],

	/**
	 * "zUp-bottom-right" movement.
	 */
	[Nav.ZUpYDownRight]: staticNav[Nav.ZUp] | staticNav[Nav.YDown] | staticNav[Nav.Right],

	/**
	 * "zUp-left" movement.
	 */
	[Nav.ZUpLeft]: staticNav[Nav.ZUp] | staticNav[Nav.Left],

	/**
	 * "zUp-right" movement.
	 */
	[Nav.ZUpRight]: staticNav[Nav.ZUp] | staticNav[Nav.Right],

	/**
	 * "zUp-top" movement.
	 */
	[Nav.ZUpYUp]: staticNav[Nav.ZUp] | staticNav[Nav.YUp],

	/**
	 * "zUp-left" movement.
	 */
	[Nav.ZUpYUpLeft]: staticNav[Nav.ZUp] | staticNav[Nav.YUp] | staticNav[Nav.Left],

	/**
	 * "zUp-right" movement.
	 */
	[Nav.ZUpYUpRight]: staticNav[Nav.ZUp] | staticNav[Nav.YUp] | staticNav[Nav.Right]
};

/**
 * A value type to which {@link navIndex} maps to.
 * Also acts as a constraint for compatibility with {@link Vector}.
 */
export type NavIndexValue = Vector extends {
	[K in VectorDimensions]: CoordinateChanges;
}
	? {
			[K in VectorDimensions]: CoordinateChanges;
	  }
	: never;

/**
 * Index representing relationship between {@link OldNav} and {@link Vector} coordinate change.
 */
export const navIndex: Map<
	Nav,
	// A constraint making sure return value is compatible with vector
	NavIndexValue
> = new Map(
	// Casting as TS forces keys to string
	// False negative
	// eslint-disable-next-line @typescript-eslint/typedef
	(Object.entries(nav) as [Nav, number][]).map(([k, v]) => [
		k,
		Object.values(VectorDimensions).reduce((result, dimension) => {
			// Explicitly verifying type
			let dimensionValue: NavIndexValue[VectorDimensions] | undefined = vectorCodecInfo[
				dimension
			].maskedCoordinateChange.get(v & vectorCodecInfo[dimension].mask);

			return {
				...result,
				[dimension]: dimensionValue === undefined ? CoordinateChanges.Neutral : dimensionValue
			};
		}, {} as NavIndexValue)
	])
);
