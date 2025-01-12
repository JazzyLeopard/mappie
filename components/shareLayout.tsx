'use client'

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Entity } from '@/lib/types'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'github-markdown-css'

interface ShareLayoutProps {
    entities: Entity[]
    selectedEntity: Entity | null
    onSelectEntity: (entity: Entity) => void
}

export function ShareLayout({ entities, selectedEntity, onSelectEntity }: ShareLayoutProps) {
    const [collapsedEpics, setCollapsedEpics] = useState<Record<string, boolean>>({})

    const toggleEpic = (epicId: string) => {
        setCollapsedEpics(prev => ({
            ...prev,
            [epicId]: !prev[epicId]
        }))
    }

    return (
        <div className="flex h-screen gap-2 pt-4 pr-4 pb-4">
            {/* Left Sidebar */}
            <div className="w-72">
                <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
                    <ScrollArea className="h-[calc(100vh-100px)]">
                        <nav className="p-4 space-y-6">
                            {entities.map((entity) => (
                                <div key={entity.id} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            className={`flex-1 justify-start text-lg font-semibold hover:bg-transparent 
                                                ${selectedEntity?.id === entity.id ? 'text-primary' : ''}`}
                                            onClick={() => onSelectEntity(entity)}
                                        >
                                            {entity.title}
                                        </Button>
                                    </div>
                                    {entity.subitems && entity.subitems.length > 0 && (
                                        <div className="ml-6 space-y-3">
                                            {entity.subitems.map((subitem) => (
                                                <div key={subitem.id} className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        {subitem.type === 'epic' ? (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-4 w-4 p-0"
                                                                    onClick={() => toggleEpic(subitem.id)}
                                                                >
                                                                    {collapsedEpics[subitem.id] ? (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    className={`text-sm hover:bg-transparent hover:underline 
                                                                        ${selectedEntity?.id === subitem.id ? 'text-primary font-medium' : ''}`}
                                                                    onClick={() => onSelectEntity(subitem)}
                                                                >
                                                                    {subitem.title}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                className={`text-sm hover:bg-transparent hover:underline 
                                                                    ${selectedEntity?.id === subitem.id ? 'text-primary font-medium' : ''}`}
                                                                onClick={() => onSelectEntity(subitem)}
                                                            >
                                                                {subitem.title}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </ScrollArea>
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-white rounded-xl">
                {selectedEntity ? (
                    <div className="flex flex-col h-full">
                        <header className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">{selectedEntity.title}</h2>
                        </header>
                        <ScrollArea className="flex-1 p-6">
                            <div className="markdown-body prose prose-slate max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedEntity.content || ''}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select an item to view its content</p>
                    </div>
                )}
            </div>
        </div>
    )
} 