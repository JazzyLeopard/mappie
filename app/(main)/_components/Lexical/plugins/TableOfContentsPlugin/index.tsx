/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {TableOfContentsEntry} from '@lexical/react/LexicalTableOfContentsPlugin';
import type {HeadingTagType} from '@lexical/rich-text';
import type {NodeKey} from 'lexical';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {TableOfContentsPlugin as LexicalTableOfContentsPlugin} from '@lexical/react/LexicalTableOfContentsPlugin';
import {useEffect, useRef, useState} from 'react';
import {Menu} from 'lucide-react';
import {cn} from '@/lib/utils';
import { TOCIcon } from './TOCIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function TableOfContentsList({
  tableOfContents,
}: {
  tableOfContents: Array<TableOfContentsEntry>;
}): JSX.Element {
  const [selectedKey, setSelectedKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const selectedIndex = useRef(0);
  const [editor] = useLexicalComposerContext();
  const timeoutRef = useRef<NodeJS.Timeout>();

  function scrollToNode(key: NodeKey, currIndex: number) {
    editor.getEditorState().read(() => {
      const domElement = editor.getElementByKey(key);
      if (domElement !== null) {
        const scrollAreaViewport = domElement.closest('[data-radix-scroll-area-viewport]');
        if (scrollAreaViewport) {
          const elementRect = domElement.getBoundingClientRect();
          const containerRect = scrollAreaViewport.getBoundingClientRect();
          const relativeTop = elementRect.top - containerRect.top + scrollAreaViewport.scrollTop;
          
          scrollAreaViewport.scrollTo({
            top: relativeTop - containerRect.height / 2 + elementRect.height / 2,
            behavior: 'smooth'
          });
        }
        setSelectedKey(key);
        selectedIndex.current = currIndex;
      }
    });
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300); // 300ms delay before hiding
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  return (
    <div className="absolute left-0 top-0 h-full" style={{ transform: 'translateX(-3rem)' }}>
      <div className="sticky top-1/2 -translate-y-1/2">
        <button
          className={cn(
            "p-2 bg-white rounded-lg hover:bg-gray-50 transition-all duration-300",
            isVisible && "bg-gray-50"
          )}
          onClick={() => setIsVisible(!isVisible)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Table of Contents"
        >
          <TOCIcon />
        </button>

        <div 
          className={cn(
            "absolute left-full top-1/2 -translate-y-1/2 ml-2 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <nav className="bg-white shadow-lg rounded-lg px-2 py-4 min-w-[20rem]">
            <div className="text-lg font-semibold mb-3 px-2 flex items-center">
              Table of Contents
            </div>
            <div className="px-2">
              <Separator className="my-2" />
            </div>
            <ScrollArea className="space-y-1 h-full overflow-y-auto overflow-x-hidden bg-slate-100">
              {tableOfContents.map(([key, text, tag], index) => (
                <button
                  key={key}
                  onClick={() => scrollToNode(key, index)}
                  className={cn(
                    'transition-colors duration-150 text-left ease-in-out p-2 w-fit grid grid-cols-1 rounded-lg hover:rounded-md hover:bg-gray-100', // Custom button styles with hover effect
                    tag === 'h1' && 'text-lg',
                    tag === 'h2' && 'ml-5 text-md', // Distinct style for h2
                    tag === 'h3' && 'ml-10 text-sm', // Distinct style for h3
                    tag === 'h4' && 'ml-14 text-xs uppercase', // Distinct style for h4
                    tag === 'h5' && 'ml-18 text-xs', // Distinct style for h5
                    selectedKey === key && 'bg-gray-100 font-semibold'
                  )}
                  title={text}
                >
                  {text}
                </button>
              ))}
            </ScrollArea>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function TableOfContentsPlugin() {
  return (
    <LexicalTableOfContentsPlugin>
      {(tableOfContents) => (
        <TableOfContentsList tableOfContents={tableOfContents} />
      )}
    </LexicalTableOfContentsPlugin>
  );
}