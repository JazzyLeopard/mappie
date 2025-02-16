/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Get hostname safely considering SSR
const getHostName = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return ''; // Default value for SSR
};

const hostName = getHostName();

export const isDevPlayground: boolean =
  hostName !== 'playground.lexical.dev' &&
  hostName !== 'lexical-playground.vercel.app';

export const DEFAULT_SETTINGS = {
  disableBeforeInput: false,
  emptyEditor: isDevPlayground,
  hasLinkAttributes: false,
  isAutocomplete: true,
  isCharLimit: false,
  isCharLimitUtf8: false,
  isCollab: false,
  isMaxLength: false,
  isRichText: true,
  measureTypingPerf: false,
  shouldPreserveNewLinesInMarkdown: false,
  shouldUseLexicalContextMenu: false,
  showNestedEditorTreeView: false,
  showTableOfContents: true,
  showTreeView: true,
  tableCellBackgroundColor: true,
  tableCellMerge: true,
} as const;

// These are mutated in setupEnv
export const INITIAL_SETTINGS: Record<SettingName, boolean> = {
  ...DEFAULT_SETTINGS,
};

export type SettingName = keyof typeof DEFAULT_SETTINGS;

export type Settings = typeof INITIAL_SETTINGS;