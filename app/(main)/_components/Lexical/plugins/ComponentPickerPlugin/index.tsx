/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createCodeNode} from '@lexical/code';
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {INSERT_EMBED_COMMAND} from '@lexical/react/LexicalAutoEmbedPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {INSERT_HORIZONTAL_RULE_COMMAND} from '@lexical/react/LexicalHorizontalRuleNode';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import {$createHeadingNode, $createQuoteNode} from '@lexical/rich-text';
import {$setBlocksType} from '@lexical/selection';
import {INSERT_TABLE_COMMAND} from '@lexical/table';
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  LexicalEditor,
  TextNode,
} from 'lexical';
import {useCallback, useMemo, useState, useEffect} from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {COMMAND_PRIORITY_NORMAL, KEY_MODIFIER_COMMAND} from 'lexical';

import useModal from '../../hooks/useModal';
import catTypingGif from '../../images/cat-typing.gif';
import {EmbedConfigs} from '../AutoEmbedPlugin';
import {INSERT_COLLAPSIBLE_COMMAND} from '../CollapsiblePlugin';
import {InsertEquationDialog} from '../EquationsPlugin';
import {INSERT_EXCALIDRAW_COMMAND} from '../ExcalidrawPlugin';
import {INSERT_IMAGE_COMMAND, InsertImageDialog} from '../ImagesPlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import {INSERT_PAGE_BREAK} from '../PageBreakPlugin';
import {InsertPollDialog} from '../PollPlugin';
import {InsertTableDialog} from '../TablePlugin';
import {AI_EDIT_COMMAND} from '../AiEditPlugin';
import { AI_WRITER_COMMAND } from '../AIWriterPlugin';
import AiGenerationIcon from '@/icons/AI-Generation';
import { ScrollArea } from "@/components/ui/scroll-area-1";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3,
  Table, 
  ListOrdered,
  List,
  CheckSquare,
  Quote,
  Code,
  Minus,
  SeparatorHorizontal,
  Columns,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronRight,
  Wand2,
  Image,
} from 'lucide-react';

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  return (
    <div
      key={option.key}
      tabIndex={-1}
      className={cn(
        "flex items-center px-3 py-1.5 text-sm cursor-pointer select-none rounded-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground"
      )}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={'typeahead-item-' + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}>
      <span className="flex items-center gap-2 flex-grow">
        {option.icon}
        <span>{option.title}</span>
      </span>
      {option.keyboardShortcut && (
        <span className="text-xs text-muted-foreground ml-auto">
          {option.keyboardShortcut}
        </span>
      )}
    </div>
  );
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
  const options: Array<ComponentPickerOption> = [];

  if (queryString == null) {
    return options;
  }

  const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (tableMatch !== null) {
    const rows = tableMatch[1];
    const colOptions = tableMatch[2]
      ? [tableMatch[2]]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

    options.push(
      ...colOptions.map(
        (columns) =>
          new ComponentPickerOption(`${rows}x${columns} Table`, {
            icon: <i className="icon table" />,
            keywords: ['table'],
            onSelect: () =>
              editor.dispatchCommand(INSERT_TABLE_COMMAND, {columns, rows}),
          }),
      ),
    );
  }

  return options;
}

type ShowModal = ReturnType<typeof useModal>[1];

function getBaseOptions(editor: LexicalEditor, showModal: ShowModal) {
  return [
    // new ComponentPickerOption('AI Writer', {
    //   icon: <Wand2 className="h-4 w-4" />,
    //   keywords: ['ai', 'write', 'generate', 'content', 'text'],
    //   onSelect: () => {
    //     editor.dispatchCommand(AI_WRITER_COMMAND, undefined);
    //   },
    // }),
    new ComponentPickerOption('Paragraph', {
      icon: <Type className="h-4 w-4" />,
      keywords: ['normal', 'paragraph', 'p', 'text'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    new ComponentPickerOption('Heading 1', {
      icon: <Heading1 className="h-4 w-4" />,
      keywords: ['1', 'heading', 'header', 'h1'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h1'));
          }
        }),
    }),
    new ComponentPickerOption('Heading 2', {
      icon: <Heading2 className="h-4 w-4" />,
      keywords: ['heading', 'header', 'h2', '2'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h2'));
          }
        }),
    }),
    new ComponentPickerOption('Heading 3', {
      icon: <Heading3 className="h-4 w-4" />,
      keywords: ['heading', 'header', 'h3', '3'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode('h3'));
          }
        }),
    }),
    new ComponentPickerOption('Table', {
      icon: <Table className="h-4 w-4" />,
      keywords: ['table', 'grid', 'spreadsheet', 'rows', 'columns'],
      onSelect: () =>
        showModal('Insert Table', (onClose) => (
          <InsertTableDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption('Numbered List', {
      icon: <ListOrdered className="h-4 w-4" />,
      keywords: ['numbered list', 'ordered list', 'ol'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Bulleted List', {
      icon: <List className="h-4 w-4" />,
      keywords: ['bulleted list', 'unordered list', 'ul'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Check List', {
      icon: <CheckSquare className="h-4 w-4" />,
      keywords: ['check list', 'todo list'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption('Quote', {
      icon: <Quote className="h-4 w-4" />,
      keywords: ['block quote'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption('Image', {
      icon: <Image className="h-4 w-4" />,
      keywords: ['image', 'photo', 'picture', 'file'],
      onSelect: () =>
        showModal('Insert Image', (onClose) => (
          <InsertImageDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption('Code', {
      icon: <Code className="h-4 w-4" />,
      keywords: ['javascript', 'python', 'js', 'codeblock'],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              // Will this ever happen?
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption('Divider', {
      icon: <Minus className="h-4 w-4" />,
      keywords: ['horizontal rule', 'divider', 'hr'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption('Page Break', {
      icon: <SeparatorHorizontal className="h-4 w-4" />,
      keywords: ['page break', 'divider'],
      onSelect: () => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined),
    }),
    // new ComponentPickerOption('Excalidraw', {
    //   icon: <i className="icon diagram-2" />,
    //   keywords: ['excalidraw', 'diagram', 'drawing'],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
    // }),
    // new ComponentPickerOption('Poll', {
    //   icon: <i className="icon poll" />,
    //   keywords: ['poll', 'vote'],
    //   onSelect: () =>
    //     showModal('Insert Poll', (onClose) => (
    //       <InsertPollDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    ...EmbedConfigs.map(
      (embedConfig) =>
        new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
          icon: embedConfig.icon,
          keywords: [...embedConfig.keywords, 'embed'],
          onSelect: () =>
            editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
        }),
    ),
    // new ComponentPickerOption('Equation', {
    //   icon: <i className="icon equation" />,
    //   keywords: ['equation', 'latex', 'math'],
    //   onSelect: () =>
    //     showModal('Insert Equation', (onClose) => (
    //       <InsertEquationDialog activeEditor={editor} onClose={onClose} />
    //     )),
    // }),
    // new ComponentPickerOption('GIF', {
    //   icon: <i className="icon gif" />,
    //   keywords: ['gif', 'animate', 'image', 'file'],
    //   onSelect: () =>
    //     editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    //       altText: 'Cat typing on a laptop',
    //       src: catTypingGif.src,
    //     }),
    // }),
    new ComponentPickerOption('Collapsible', {
      icon: <ChevronRight className="h-4 w-4" />,
      keywords: ['collapse', 'collapsible', 'toggle'],
      onSelect: () =>
        editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption('Columns Layout', {
      icon: <Columns className="h-4 w-4" />,
      keywords: ['columns', 'layout', 'grid'],
      onSelect: () =>
        showModal('Insert Columns Layout', (onClose) => (
          <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption('Align Left', {
      icon: <AlignLeft className="h-4 w-4" />,
      keywords: ['align', 'left'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'),
    }),
    new ComponentPickerOption('Align Center', {
      icon: <AlignCenter className="h-4 w-4" />,
      keywords: ['align', 'center'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'),
    }),
    new ComponentPickerOption('Align Right', {
      icon: <AlignRight className="h-4 w-4" />,
      keywords: ['align', 'right'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'),
    }),
    new ComponentPickerOption('Align Justify', {
      icon: <AlignJustify className="h-4 w-4" />,
      keywords: ['align', 'justify'],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'),
    }),
  ];
}

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, 'i');

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          {selectedIndex, selectOptionAndCleanUp, setHighlightedIndex},
        ) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                <Card className="w-64 shadow-md">
                  <ScrollArea className="h-[300px]">
                    <div className="p-1 space-y-0.5">
                      {options.map((option, i: number) => (
                        <ComponentPickerMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => {
                            setHighlightedIndex(i);
                          }}
                          key={option.key}
                          option={option}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </Card>,
                anchorElementRef.current,
              )
            : null
        }
      />
    </>
  );
}