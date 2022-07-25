/*
	Copyright 2022 cpuabuse.com
	Licensed under the ISC License (https://opensource.org/licenses/ISC)
*/

/**
 * Relations to parents, to prevent circular deps.
 *
 * @file
 */

import { CoreArgIds } from "./arg";

// Infer type from `as const` assertion
/* eslint-disable @typescript-eslint/typedef */

/** Grid parent ID. */
export const coreGridArgParentId = CoreArgIds.Shard as const;
/** Cell parent ID. */
export const coreCellArgParentId = CoreArgIds.Grid as const;
/** Entity parent ID. */
export const coreEntityArgParentId = CoreArgIds.Cell as const;

/** Core shard arg parent IDs. */
export const coreShardArgParentIds = [] as const;
/** Tuple with core grid arg parent IDS. */
export const coreGridArgParentIds = [...coreShardArgParentIds, coreGridArgParentId] as const;
/** Tuple with core cell arg parent IDS. */
export const coreCellArgParentIds = [...coreGridArgParentIds, coreCellArgParentId] as const;
/** Tuple with core entity arg parent IDS. */
export const coreEntityArgParentIds = [...coreCellArgParentIds, coreEntityArgParentId] as const;

/** Tuple with core grid arg grandparent IDS. */
export const coreGridArgGrandparentIds = [...coreShardArgParentIds] as const;
/** Tuple with core cell arg grandparent IDS. */
export const coreCellArgGrandparentIds = [...coreGridArgParentIds] as const;
/** Tuple with core entity arg grandparent IDS. */
export const coreEntityArgGrandparentIds = [...coreCellArgParentIds] as const;

/* eslint-enable @typescript-eslint/typedef */

/** Unique set with parent ID's for core cell arg. */
export const coreGridArgParentIdSet: Set<CoreGridArgParentIds> = new Set(coreGridArgParentIds);
/** Unique set with parent ID's for core cell arg. */
export const coreCellArgParentIdSet: Set<CoreCellArgParentIds> = new Set(coreCellArgParentIds);
/** Unique set with parent ID's for core entity arg. */
export const coreEntityArgParentIdSet: Set<CoreEntityArgParentIds> = new Set(coreEntityArgParentIds);

/** Unique set with grandparent ID's for core cell arg. */
export const coreGridArgGrandparentIdSet: Set<CoreGridArgGrandparentIds> = new Set(coreGridArgGrandparentIds);
/** Unique set with grandparent ID's for core cell arg. */
export const coreCellArgGrandparentIdSet: Set<CoreCellArgGrandparentIds> = new Set(coreCellArgGrandparentIds);
/** Unique set with grandparent ID's for core entity arg. */
export const coreEntityArgGrandparentIdSet: Set<CoreEntityArgGrandparentIds> = new Set(coreEntityArgGrandparentIds);

/** Parent ID of {@link CoreShardArg}. */
export type CoreShardArgParentId = never;
/** Grid parent Id. */
export type CoreGridArgParentId = typeof coreGridArgParentId;
/** Cell parent ID. */
export type CoreCellArgParentId = typeof coreCellArgParentId;
/** Entity parent ID. */
export type CoreEntityArgParentId = typeof coreEntityArgParentId;

/** IDs of parents of {@link CoreShardArg}. */
export type CoreShardArgParentIds = typeof coreShardArgParentIds[number];
/** IDs of parents of {@link CoreCellArg}. */
export type CoreGridArgParentIds = typeof coreGridArgParentIds[number];
/** IDs of parents of {@link CoreCellArg}. */
export type CoreCellArgParentIds = typeof coreCellArgParentIds[number];
/** {@link CoreEntityArg} parent IDs. */
export type CoreEntityArgParentIds = typeof coreEntityArgParentIds[number];

/** IDs of grandparents of {@link CoreShardArg}. */
export type CoreShardArgGrandparentIds = never;
/** IDs of grandparents of {@link CoreGridArg}. */
export type CoreGridArgGrandparentIds = typeof coreGridArgGrandparentIds[number];
/** IDs of grandparents of {@link CoreCellArg}. */
export type CoreCellArgGrandparentIds = typeof coreCellArgGrandparentIds[number];
/** {@link CoreEntityArg} grandparent IDs. */
export type CoreEntityArgGrandparentIds = typeof coreEntityArgGrandparentIds[number];
