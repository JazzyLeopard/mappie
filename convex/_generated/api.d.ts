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
import type * as init from "../init.js";
import type * as knowledgeBase from "../knowledgeBase.js";
import type * as messages from "../messages.js";
import type * as projects from "../projects.js";
import type * as shareLink from "../shareLink.js";
import type * as templates from "../templates.js";
import type * as useCases from "../useCases.js";
import type * as userstories from "../userstories.js";
import type * as utils_systemTemplates from "../utils/systemTemplates.js";
import type * as utils_workItemValidation from "../utils/workItemValidation.js";
import type * as utils_workspaceAuth from "../utils/workspaceAuth.js";
import type * as workItems from "../workItems.js";
import type * as workspaces from "../workspaces.js";

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
  init: typeof init;
  knowledgeBase: typeof knowledgeBase;
  messages: typeof messages;
  projects: typeof projects;
  shareLink: typeof shareLink;
  templates: typeof templates;
  useCases: typeof useCases;
  userstories: typeof userstories;
  "utils/systemTemplates": typeof utils_systemTemplates;
  "utils/workItemValidation": typeof utils_workItemValidation;
  "utils/workspaceAuth": typeof utils_workspaceAuth;
  workItems: typeof workItems;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
