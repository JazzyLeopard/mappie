"use client";

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useMemo } from 'react';
import * as React from 'react';
import PlaygroundEditorTheme from './themes/PlayGroundEditorTheme';

import Editor from './Editor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { TableContext } from './plugins/TablePlugin';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { FlashMessageContext } from './context/FlashMessageContext';
import { useSettings } from './context/SettingsContext';
import { SuggestionCardNode } from './plugins/AiEditPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { ENHANCED_TRANSFORMERS } from './plugins/MarkdownTransformers';

type LexicalEditorProps = {
  onBlur: () => Promise<void>;
  attribute: string;
  projectDetails: any;
  setProjectDetails: (value: any) => void;
  isRichText: boolean;
  context: 'project' | 'useCase' | 'functionalRequirement' | 'epics' | 'userStories';
  itemId: string;
};

function LexicalEditor({
  onBlur,
  attribute,
  projectDetails,
  setProjectDetails,
  isRichText,
  context,
  itemId,
}: LexicalEditorProps): JSX.Element {
  const {settings: {isCollab, emptyEditor}} = useSettings();
  
  const initialConfig = useMemo(() => ({
    namespace: 'MyEditor',
    theme: PlaygroundEditorTheme,
    nodes: [...PlaygroundNodes, SuggestionCardNode],
    onError: (error: Error) => {
      console.error(error);
    },
  }), []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <MarkdownShortcutPlugin transformers={TRANSFORMERS}/>
              <div className="editor-shell">
                <Editor
                  attribute={attribute}
                setProjectDetails={setProjectDetails}
                initialContent={projectDetails?.[attribute]}
                context={context}
                itemId={itemId}
              />
            </div>
          </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext>
    </LexicalComposer>
  );
}

export default function LexicalEditorComponent(props: LexicalEditorProps): JSX.Element {
  return (
    <FlashMessageContext>
      <LexicalEditor {...props} />
    </FlashMessageContext>
  )
}