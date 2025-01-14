import * as React from 'react'
import { createPortal } from 'react-dom'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $patchStyleText } from '@lexical/selection'
import { mergeRegister } from '@lexical/utils'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { ColorPicker } from '@/components/ui/color-picker'
import { Icons } from '@/icons/icons'
import { getDOMRangeRect } from '../../utils/getDOMRangeRect'
import { setFloatingElemPosition } from '../../utils/setFloatingElemPosition'
import { getSelectedNode } from '../../utils/getSelectedNode'
import { AI_EDIT_COMMAND } from '../AiEditPlugin'
import { IS_APPLE } from '../../shared/environment'
import AiGenerationIcon from '@/icons/AI-Generation'

const TOP_OFFSET = 50; // Increased to give more space at the top

function FloatingToolbar({ editor, anchorElem, isLink, setIsLinkEditMode }: { editor: any, anchorElem: any, isLink: any, setIsLinkEditMode: any }) {
  const popupCharStylesEditorRef = React.useRef<HTMLDivElement | null>(null)

  const updateTextFormatFloatingToolbar = React.useCallback(() => {
    const selection = $getSelection()
    const popupCharStylesEditorElem = popupCharStylesEditorRef.current
    const nativeSelection = window.getSelection()

    if (popupCharStylesEditorElem === null) {
      return
    }

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const rangeRect = getDOMRangeRect(nativeSelection, rootElement)
      const viewportHeight = window.innerHeight

      // Check if selection is too close to the top
      const isNearTop = rangeRect.top < TOP_OFFSET

      // Position the toolbar
      setFloatingElemPosition(
        rangeRect,
        popupCharStylesEditorElem,
        anchorElem,
        isNearTop
      )
    }
  }, [editor, anchorElem, isLink])

  React.useEffect(() => {
    const scrollerElem = anchorElem.parentElement

    const update = () => {
      editor.getEditorState().read(() => {
        updateTextFormatFloatingToolbar()
      })
    }

    window.addEventListener('resize', update)
    if (scrollerElem) {
      scrollerElem.addEventListener('scroll', update)
    }

    return () => {
      window.removeEventListener('resize', update)
      if (scrollerElem) {
        scrollerElem.removeEventListener('scroll', update)
      }
    }
  }, [editor, updateTextFormatFloatingToolbar, anchorElem])

  React.useEffect(() => {
    editor.getEditorState().read(() => {
      updateTextFormatFloatingToolbar()
    })
    return mergeRegister(
      editor.registerUpdateListener(() => {
        editor.getEditorState().read(() => {
          updateTextFormatFloatingToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateTextFormatFloatingToolbar()
          return false
        },
        1
      )
    )
  }, [editor, updateTextFormatFloatingToolbar])

  const insertLink = React.useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      setIsLinkEditMode(false)
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink, setIsLinkEditMode])

  const applyStyleText = React.useCallback(
    (styles: Record<string, string>) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, styles)
        }
      })
    },
    [editor]
  )

  const onFontColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ color: value })
    },
    [applyStyleText]
  )

  const onBgColorSelect = React.useCallback(
    (value: string) => {
      applyStyleText({ 'background-color': value })
    },
    [applyStyleText]
  )

  return (
    <div
      ref={popupCharStylesEditorRef}
      className="fixed z-[9999] flex items-center justify-center gap-1 rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-opacity duration-300"
      style={{
        position: 'fixed',
        top: 0,
        left: 500,
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
        zIndex: 2147483647
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          editor.dispatchCommand(AI_EDIT_COMMAND, undefined)
        }}
        className="flex items-center gap-2"
        aria-label="AI Edit"
      >
        <AiGenerationIcon className="h-4 w-4" />
        <span>AI Edit</span>
        <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
          {IS_APPLE ? '⌘' : 'Ctrl'} + E
        </span>
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
        }}
        aria-label="Format text as bold"
      >
        <Icons.bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
        }}
        aria-label="Format text as italics"
      >
        <Icons.italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
        }}
        aria-label="Format text to underlined"
      >
        <Icons.underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
        }}
        aria-label="Format text with a strikethrough"
      >
        <Icons.strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')
        }}
        aria-label="Insert code block"
      >
        <Icons.code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={insertLink}
        aria-label="Insert link"
      >
        <Icons.link className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Set text color">
            <Icons.palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit">
          <ColorPicker onColorChange={onFontColorSelect} />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Set background color">
            <Icons.bgColor className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit">
          <ColorPicker onColorChange={onBgColorSelect} />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export function FloatingTextFormatToolbarPlugin({
  anchorElem = document.body,
  setIsLinkEditMode,
}: {
  anchorElem?: HTMLElement
  setIsLinkEditMode: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const [isText, setIsText] = React.useState(false)
  const [isLink, setIsLink] = React.useState(false)

  const updatePopup = React.useCallback(() => {
    editor.getEditorState().read(() => {
      if (editor.isComposing()) {
        return
      }
      const selection = $getSelection()
      const nativeSelection = window.getSelection()
      const rootElement = editor.getRootElement()

      if (
        nativeSelection !== null &&
        (!$isRangeSelection(selection) ||
          rootElement === null ||
          !rootElement.contains(nativeSelection.anchorNode))
      ) {
        setIsText(false)
        return
      }

      if (!$isRangeSelection(selection)) {
        return
      }

      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true)
      } else {
        setIsLink(false)
      }

      if (selection.getTextContent() !== '') {
        console.log('Setting isText to true')
        setIsText(true)
      } else {
        setIsText(false)
      }
    })
  }, [editor])

  React.useEffect(() => {
    document.addEventListener('selectionchange', updatePopup)
    return () => {
      document.removeEventListener('selectionchange', updatePopup)
    }
  }, [updatePopup])

  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(() => {
        updatePopup()
      }),
      editor.registerRootListener(() => {
        if (editor.getRootElement() === null) {
          setIsText(false)
        }
      })
    )
  }, [editor, updatePopup])

  if (!isText) {
    return null
  }

  return createPortal(
    <FloatingToolbar
      editor={editor}
      anchorElem={anchorElem}
      isLink={isLink}
      setIsLinkEditMode={setIsLinkEditMode}
    />,
    anchorElem
  )
}

