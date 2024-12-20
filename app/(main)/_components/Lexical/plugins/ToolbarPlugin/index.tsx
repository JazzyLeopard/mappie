/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from '@lexical/list';
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import { $isTableNode, $isTableSelection } from '@lexical/table';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import { IS_APPLE } from '../../shared/environment';

import useModal from '../../hooks/useModal';
import catTypingGif from '../../images/cat-typing.gif';
import { $createStickyNode } from '../../nodes/StickyNode';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { EmbedConfigs } from '../AutoEmbedPlugin';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import { InsertEquationDialog } from '../EquationsPlugin';
import { INSERT_EXCALIDRAW_COMMAND } from '../ExcalidrawPlugin';
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  InsertImagePayload,
} from '../ImagesPlugin';
import { InsertInlineImageDialog } from '../InlineImagePlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import { INSERT_PAGE_BREAK } from '../PageBreakPlugin';
import { InsertPollDialog } from '../PollPlugin';
import { InsertTableDialog } from '../TablePlugin';
import { AI_EDIT_COMMAND } from '../AiEditPlugin';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import {
  Undo2,
  Redo2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Link2Off,
  Bold,
  Italic,
  Underline,
  Table,
  Image,
  SeparatorHorizontal,
  ChevronRight,
  Columns,
  Wand2,
  IndentIcon,
  OutdentIcon,
  Plus,
  Table2,
} from 'lucide-react';


const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

interface ElementFormatOption {
  icon: JSX.Element;
  iconRTL: JSX.Element;
  name: string;
}

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: ElementFormatOption;
} = {
  left: {
    icon: <AlignLeft className="h-4 w-4" />,
    iconRTL: <AlignLeft className="h-4 w-4" />,
    name: 'Left Align',
  },
  center: {
    icon: <AlignCenter className="h-4 w-4" />,
    iconRTL: <AlignCenter className="h-4 w-4" />,
    name: 'Center Align',
  },
  right: {
    icon: <AlignRight className="h-4 w-4" />,
    iconRTL: <AlignRight className="h-4 w-4" />,
    name: 'Right Align',
  },
  justify: {
    icon: <AlignJustify className="h-4 w-4" />,
    iconRTL: <AlignJustify className="h-4 w-4" />,
    name: 'Justify Align',
  },
  start: {
    icon: <AlignLeft className="h-4 w-4" />,
    iconRTL: <AlignRight className="h-4 w-4" />,
    name: 'Start Align',
  },
  end: {
    icon: <AlignRight className="h-4 w-4" />,
    iconRTL: <AlignLeft className="h-4 w-4" />,
    name: 'End Align',
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return 'active dropdown-item-active';
  } else {
    return '';
  }
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>('root');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  // const [fontSize, setFontSize] = useState<string>('15px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  // const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  // const [isStrikethrough, setIsStrikethrough] = useState(false);
  // const [isSubscript, setIsSubscript] = useState(false);
  // const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isImageCaption, setIsImageCaption] = useState(false);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== 'check') {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        setIsImageCaption(
          !!rootElement?.parentElement?.classList.contains(
            'image-caption-container',
          ),
        );
      } else {
        setIsImageCaption(false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType('table');
      } else {
        setRootType('root');
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      // setFontFamily(
      //   $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      // );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left',
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      // setIsStrikethrough(selection.hasFormat('strikethrough'));
      // setIsSubscript(selection.hasFormat('subscript'));
      // setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      // setFontSize(
      //   $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      // );
    }
  }, [activeEditor, editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === 'KeyE' && (ctrlKey || metaKey)) {
          event.preventDefault();
          return activeEditor.dispatchCommand(AI_EDIT_COMMAND, undefined as any);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {},
      );
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();
        const extractedNodes = selection.extract();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode;
            }
            /**
             * If the selected text has one format applied
             * selecting a portion of the text, could
             * clear the format to the wrong portion of the text.
             *
             * The cleared text is based on the length of the selected text.
             */
            // We need this in case the selected text only has one format
            const extractedTextNode = extractedNodes[0];
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode;
            }

            if (textNode.__style !== '') {
              textNode.setStyle('');
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
            }
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl('https://'),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const canViewerSeeInsertDropdown = !isImageCaption;
  const canViewerSeeInsertCodeButton = !isImageCaption;

  const getFormatOption = () => {
    if (elementFormat in ELEMENT_FORMAT_OPTIONS) {
      return ELEMENT_FORMAT_OPTIONS[elementFormat as keyof typeof ELEMENT_FORMAT_OPTIONS];
    }
    return ELEMENT_FORMAT_OPTIONS['left'];
  };

  return (
    <Menubar className="border-0 w-full justify-start gap-1 px-4 pb-2 mb-2 sticky top-0 bg-white z-10 shadow-xl shadow-b shadow-white">
      {/* Undo/Redo Group */}
      <MenubarMenu>
        <MenubarTrigger
          disabled={!canUndo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          className="h-8 w-8 p-0 flex items-center justify-center hover:bg-slate-100"
          title={IS_APPLE ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}>
          <Undo2 className="h-4 w-4" />
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger
          disabled={!canRedo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          className="h-8 w-8 p-0 flex items-center justify-center hover:bg-slate-100"
          title={IS_APPLE ? 'Redo (⇧⌘Z)' : 'Redo (Ctrl+Y)'}>
          <Redo2 className="h-4 w-4" />
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarSeparator />

      {/* Block Format Dropdown */}
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <MenubarMenu>
            <MenubarTrigger disabled={!isEditable} className="gap-2 hover:bg-slate-100">
              {blockType === 'paragraph' && <Type className="h-4 w-4" />}
              {blockType === 'h1' && <Heading1 className="h-4 w-4" />}
              {blockType === 'h2' && <Heading2 className="h-4 w-4" />}
              {blockType === 'h3' && <Heading3 className="h-4 w-4" />}
              {blockType === 'bullet' && <List className="h-4 w-4" />}
              {blockType === 'number' && <ListOrdered className="h-4 w-4" />}
              {blockType === 'check' && <CheckSquare className="h-4 w-4" />}
              {blockType === 'quote' && <Quote className="h-4 w-4" />}
              {blockType === 'code' && <Code className="h-4 w-4" />}
              {blockTypeToBlockName[blockType]}
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={formatParagraph}>
                <Type className="h-4 w-4 mr-2" />
                Normal
              </MenubarItem>
              <MenubarItem onClick={() => formatHeading('h1')}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </MenubarItem>
              <MenubarItem onClick={() => formatHeading('h2')}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </MenubarItem>
              <MenubarItem onClick={() => formatHeading('h3')}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </MenubarItem>
              <MenubarItem onClick={formatBulletList}>
                <List className="h-4 w-4 mr-2" />
                Bullet List
              </MenubarItem>
              <MenubarItem onClick={formatNumberedList}>
                <ListOrdered className="h-4 w-4 mr-2" />
                Numbered List
              </MenubarItem>
              <MenubarItem onClick={formatCheckList}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Check List
              </MenubarItem>
              <MenubarItem onClick={formatQuote}>
                <Quote className="h-4 w-4 mr-2" />
                Quote
              </MenubarItem>
              <MenubarItem onClick={formatCode}>
                <Code className="h-4 w-4 mr-2" />
                Code Block
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarSeparator />
        </>
      )}

      {/* Code Language Dropdown */}
      {blockType === 'code' ? (
        <MenubarMenu>
          <MenubarTrigger disabled={!isEditable}>
            {getLanguageFriendlyName(codeLanguage)}
          </MenubarTrigger>
          <MenubarContent>
            {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
              <MenubarItem
                key={value}
                onClick={() => onCodeLanguageSelect(value)}>
                {name}
              </MenubarItem>
            ))}
          </MenubarContent>
        </MenubarMenu>
      ) : (
        <>
          {/* Insert Dropdown */}
          {canViewerSeeInsertDropdown && (
            <MenubarMenu>
              <MenubarTrigger 
                disabled={!isEditable} 
                className="flex items-center gap-2 hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Insert
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      INSERT_HORIZONTAL_RULE_COMMAND,
                      undefined,
                    );
                  }}>
                  <SeparatorHorizontal className="h-4 w-4 mr-2" />
                  Horizontal Rule
                </MenubarItem>
                <MenubarItem
                  onClick={() => {
                    showModal('Insert Table', (onClose) => (
                      <InsertTableDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}>
                  <Table2 className="h-4 w-4 mr-2" />
                  Table
                </MenubarItem>
                <MenubarItem
                  onClick={() => {
                    showModal('Insert Image', (onClose) => (
                      <InsertImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}>
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </MenubarItem>
                <MenubarItem
                  onClick={() => {
                    showModal('Insert Columns Layout', (onClose) => (
                      <InsertLayoutDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}>
                  <Columns className="h-4 w-4 mr-2" />
                  Columns Layout
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          )}
        </>
      )}

      <MenubarSeparator />

      {/* Element Format Dropdown */}
      <MenubarMenu>
        <MenubarTrigger
          disabled={!isEditable}
          className="gap-2 hover:bg-slate-100">
          {isRTL ? getFormatOption().iconRTL : getFormatOption().icon}
          {getFormatOption().name}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}>
            <AlignLeft className="h-4 w-4 mr-2" />
            Left Align
          </MenubarItem>
          <MenubarItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}>
            <AlignCenter className="h-4 w-4 mr-2" />
            Center Align
          </MenubarItem>
          <MenubarItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}>
            <AlignRight className="h-4 w-4 mr-2" />
            Right Align
          </MenubarItem>
          <MenubarItem onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}>
            <AlignJustify className="h-4 w-4 mr-2" />
            Justify Align
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>
            {isRTL ? (
              <IndentIcon className="h-4 w-4 mr-2" />
            ) : (
              <OutdentIcon className="h-4 w-4 mr-2" />
            )}
            Outdent
          </MenubarItem>
          <MenubarItem onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>
            {isRTL ? (
              <OutdentIcon className="h-4 w-4 mr-2" />
            ) : (
              <IndentIcon className="h-4 w-4 mr-2" />
            )}
            Indent
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {modal}
    </Menubar>
  );
}