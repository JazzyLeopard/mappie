/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin} from '@lexical/react/LexicalMarkdownShortcutPlugin';
import * as React from 'react';
import {ENHANCED_TRANSFORMERS} from '../MarkdownTransformers';
import type {Transformer} from '@lexical/markdown';

interface MarkdownPluginProps {
  transformers?: Transformer[];
}

export default function MarkdownPlugin({
  transformers = ENHANCED_TRANSFORMERS,
}: MarkdownPluginProps): JSX.Element {
  return <LexicalMarkdownShortcutPlugin transformers={transformers} />;
}