/**
 * English copy overrides.
 *
 * IMPORTANT: English and Korean copy are intentionally stored separately.
 * - Edit English wording in this file.
 * - Edit Korean wording in ko.ts.
 *
 * The lookup keys are stable source IDs used by the existing components. Changing
 * a value here never changes the Korean value.
 */

import { ko } from "./ko";

const englishDefaults = Object.fromEntries(Object.keys(ko).map((key) => [key, key])) as Record<string, string>;

export const en: Record<string, string> = {
  ...englishDefaults,

  // Put English-only wording overrides below. The key must stay unchanged.
  // Example:
  // "you just found": "WELCOME TO",
};
