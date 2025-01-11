'use client'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Entity } from '@/lib/types'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css'

interface SidePanelProps {
    isOpen: boolean
    entity: Entity | null
    onClose: () => void
}

export function SidePanel({ isOpen, entity, onClose }: SidePanelProps) {
    const [shouldRender, setShouldRender] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
        } else {
            const timer = setTimeout(() => setShouldRender(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!shouldRender) return null

    const formatEpicContent = (content: string) => {
        return content
            .replace(/•/g, '\n•')
            .trim();
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div
                className={`fixed inset-y-0 right-0 w-[600px] border-l bg-background p-0 shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex h-16 items-center justify-between border-b px-6">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold">{entity?.title}</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close panel</span>
                    </Button>
                </div>
                <ScrollArea className="h-[calc(100vh-4rem)]">
                    <div className="p-6">
                        <div className="markdown-body prose prose-slate max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                            >
                                {entity?.type === 'epic' ? formatEpicContent(entity.content || '') : entity?.content || ''}
                            </ReactMarkdown>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

