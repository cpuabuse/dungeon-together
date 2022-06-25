/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Default entity.
 *
 * @file
 */

import { EntityKindClassFactory } from "../entity/entity-kind";

/**
 * Default entity kind.
 *
 * @remarks
 * Return type ensures type safety for constructor params of resulting class.
 *
 * @param param - Destructured parameter
 * @returns New class
 */
// Parameters inferred
// eslint-disable-next-line @typescript-eslint/typedef
export const DefaultKindClassFactory: EntityKindClassFactory = function ({ Base }) {
	/**
	 * Default entity kind class.
	 */
	return class DefaultKind extends Base {};
};
