'use client'

import { Button } from "@/components/ui/button"
import { Entity } from '@/lib/types'
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface EntityNavProps {
    entities: Entity[]
    selectedEntity: Entity | null
    onSelectEntity: (entity: Entity) => void
}

export function EntityNav({ entities, selectedEntity, onSelectEntity }: EntityNavProps) {
    const [collapsedEpics, setCollapsedEpics] = useState<Record<string, boolean>>({})

    const toggleEpic = (epicId: string) => {
        setCollapsedEpics(prev => ({
            ...prev,
            [epicId]: !prev[epicId]
        }))
    }

    return (
        <nav className="space-y-6">
            {entities.map((entity) => (
                <div key={entity.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className={`flex-1 justify-start text-lg font-semibold hover:bg-transparent 
                                ${entity.content ? 'hover:underline' : 'cursor-default hover:no-underline'}
                                ${selectedEntity?.id === entity.id ? 'text-primary' : ''}`}
                            onClick={() => entity.content && onSelectEntity(entity)}
                        >
                            {entity.title}
                            {entity.type === 'section' && (
                                <span className="ml-2 text-sm text-muted-foreground">
                                    ({entity.subitems?.length || 0})
                                </span>
                            )}
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
                                            <>
                                                <div className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
                                                <Button
                                                    variant="ghost"
                                                    className={`text-sm hover:bg-transparent hover:underline 
                                                        ${selectedEntity?.id === subitem.id ? 'text-primary font-medium' : ''}`}
                                                    onClick={() => onSelectEntity(subitem)}
                                                >
                                                    {subitem.title}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                    {/* User Stories dropdown for epics */}
                                    {subitem.type === 'epic' && !collapsedEpics[subitem.id] && (
                                        <div className="ml-8 space-y-2">
                                            {subitem.userStories && subitem.userStories.length > 0 &&
                                                <div className="text-md font-semibold mb-2">
                                                    User Stories
                                                    <span className="ml-2 text-sm text-muted-foreground">
                                                        ({subitem.userStories?.length || 0})
                                                    </span>
                                                </div>
                                            }
                                            {subitem.userStories && subitem.userStories.length > 0 ? (
                                                subitem.userStories.map((story) => (
                                                    <div key={story._id} className="flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-full bg-foreground/50" />
                                                        <Button
                                                            variant="ghost"
                                                            className={`text-sm hover:bg-transparent hover:underline 
                                                                ${selectedEntity?.id === story._id ? 'text-primary font-medium' : ''}`}
                                                            onClick={() => onSelectEntity({
                                                                id: story._id,
                                                                title: story.title || `User Story ${story._id}`,
                                                                content: story.description,
                                                                type: 'useCase'
                                                            })}
                                                        >
                                                            {story.title || `User Story ${story._id}`}
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-sm text-muted-foreground italic pl-3">
                                                    No user stories for this epic
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    )
}

