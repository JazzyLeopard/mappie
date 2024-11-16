"use client";

import { $createLinkNode } from '@lexical/link';
import { $createListItemNode, $createListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { 
  $createParagraphNode, 
  $createTextNode, 
  $getRoot,
  $parseSerializedNode,
  LexicalEditor as LexicalEditorType,
  SerializedEditorState,
  SerializedLexicalNode
} from 'lexical';
import { useEffect, useMemo } from 'react';
import * as React from 'react';
import PlaygroundEditorTheme from './themes/PlayGroundEditorTheme';

import dynamic from 'next/dynamic';

import Editor from './Editor';
import { SharedHistoryContext } from './context/SharedHistoryContext';
import { TableContext } from './plugins/TablePlugin';
import { SharedAutocompleteContext } from './context/SharedAutocompleteContext';
import PlaygroundNodes from './nodes/PlaygroundNodes';
import { FlashMessageContext } from './context/FlashMessageContext';
import './index.css';
import { useSettings } from './context/SettingsContext';

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
    nodes: [...PlaygroundNodes],
    onError: (error: Error) => {
      console.error(error);
    },
    editorState: projectDetails?.[attribute] ? () => {
      try {
        const parsedContent = JSON.parse(projectDetails[attribute]);
        return (editor: LexicalEditorType) => {
          const currentState = editor.getEditorState();
          const currentSelection = currentState._selection;
          
          const newState = editor.parseEditorState(parsedContent);
          if (currentSelection) {
            newState._selection = currentSelection;
          }
          return newState;
        };
      } catch (error) {
        console.error('Failed to parse initial content:', error);
        return null;
      }
    } : undefined,
  }), [attribute, projectDetails]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext>
            <div className="min-h-full flex flex-col">
              <div className="editor-shell">
                <Editor
                  attribute={attribute}
                  setProjectDetails={setProjectDetails}
                  initialContent={projectDetails?.[attribute]}
                  context={context}
                  itemId={itemId}
                />
              </div>
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