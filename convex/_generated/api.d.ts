/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as debug from "../debug.js";
import type * as integrations from "../integrations.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as proposals from "../proposals.js";
import type * as seedData from "../seedData.js";
import type * as timeTracking from "../timeTracking.js";
import type * as workOrders from "../workOrders.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  debug: typeof debug;
  integrations: typeof integrations;
  invoices: typeof invoices;
  leads: typeof leads;
  proposals: typeof proposals;
  seedData: typeof seedData;
  timeTracking: typeof timeTracking;
  workOrders: typeof workOrders;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
