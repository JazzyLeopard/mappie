/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {Provider} from '@lexical/yjs';
import {WebsocketProvider} from 'y-websocket';
import {Doc} from 'yjs';
import {getYjsInstance} from './shared/yjs-instance';

// Move URL parsing into a function that only runs on client-side
const getWebsocketEndpoint = () => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    return params.get('collabEndpoint') || 'ws://localhost:1234';
  }
  return 'ws://localhost:1234'; // default fallback for SSR
};

const WEBSOCKET_ENDPOINT = getWebsocketEndpoint();
const WEBSOCKET_SLUG = 'playground';
const WEBSOCKET_ID = typeof window !== 'undefined' 
  ? new URLSearchParams(window.location.search).get('collabId') || '0'
  : '0';

// Add type for the expected user state
interface UserState {
  anchorPos: number;
  color: string;
  focusing: boolean;
  focusPos: number;
  name: string;
  selecting: boolean;
}

// parent dom -> child doc
export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Doc>,
): Provider | null {
  if (typeof window === 'undefined') {
    return null; // Return null during SSR
  }

  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = getYjsInstance();
    if (doc) {
      yjsDocMap.set(id, doc);
    }
  } else {
    doc.load();
  }

  if (!doc) {
    return null;
  }

  // Create the provider with proper type casting
  const provider = new WebsocketProvider(
    WEBSOCKET_ENDPOINT,
    WEBSOCKET_SLUG + '/' + WEBSOCKET_ID + '/' + id,
    doc,
    {
      connect: false,
    },
  );

  // Add type assertion to make it compatible with Provider interface
  return provider as unknown as Provider;
}