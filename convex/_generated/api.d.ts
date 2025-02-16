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
import type * as documents from "../documents.js";
import type * as epics from "../epics.js";
import type * as functionalRequirements from "../functionalRequirements.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as shareLink from "../shareLink.js";
import type * as useCases from "../useCases.js";
import type * as userstories from "../userstories.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  epics: typeof epics;
  functionalRequirements: typeof functionalRequirements;
  messages: typeof messages;
  projects: typeof projects;
  shareLink: typeof shareLink;
  useCases: typeof useCases;
  userstories: typeof userstories;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
