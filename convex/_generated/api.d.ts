/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as emails from "../emails.js";
import type * as favorites from "../favorites.js";
import type * as files from "../files.js";
import type * as helpers from "../helpers.js";
import type * as listings from "../listings.js";
import type * as organizations from "../organizations.js";
import type * as passwords from "../passwords.js";
import type * as seed from "../seed.js";
import type * as seedImageHelpers from "../seedImageHelpers.js";
import type * as seedImages from "../seedImages.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  emails: typeof emails;
  favorites: typeof favorites;
  files: typeof files;
  helpers: typeof helpers;
  listings: typeof listings;
  organizations: typeof organizations;
  passwords: typeof passwords;
  seed: typeof seed;
  seedImageHelpers: typeof seedImageHelpers;
  seedImages: typeof seedImages;
  users: typeof users;
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
