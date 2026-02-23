/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as biometrics from "../biometrics.js";
import type * as courtAppearances from "../courtAppearances.js";
import type * as healthCheck from "../healthCheck.js";
import type * as inmate from "../inmate.js";
import type * as inmateVisits from "../inmateVisits.js";
import type * as misc from "../misc.js";
import type * as offenses from "../offenses.js";
import type * as officerMisc from "../officerMisc.js";
import type * as officers from "../officers.js";
import type * as prisons from "../prisons.js";
import type * as recordMovements from "../recordMovements.js";
import type * as relations from "../relations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  biometrics: typeof biometrics;
  courtAppearances: typeof courtAppearances;
  healthCheck: typeof healthCheck;
  inmate: typeof inmate;
  inmateVisits: typeof inmateVisits;
  misc: typeof misc;
  offenses: typeof offenses;
  officerMisc: typeof officerMisc;
  officers: typeof officers;
  prisons: typeof prisons;
  recordMovements: typeof recordMovements;
  relations: typeof relations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
