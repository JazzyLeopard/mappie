'use client'
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { Entity } from "@/lib/types";
import { useQuery } from "convex/react";
import { FileText, GitPullRequest, Home, Layers } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PageProps {
    params: Promise<{
        shareId: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface TableOfContentsEntry {
    id: string;
    text: string;
    tag: 'h1' | 'h2' | 'h3' | 'h4';
}

function extractHeadings(content: string): TableOfContentsEntry[] {
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));
    
    return matches.map((match) => ({
        id: `heading-${match[2].toLowerCase().replace(/\s+/g, '-')}`,
        text: match[2],
        tag: `h${match[1].length}` as 'h1' | 'h2' | 'h3' | 'h4'
    }));
}

export default function SharePage({ params: paramsPromise }: PageProps) {
    const [shareId, setShareId] = useState<string | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [mappedEntities, setMappedEntities] = useState<Entity[]>([]);
    const [selectedWorkItem, setSelectedWorkItem] = useState<{id: string, title: string, content: string} | null>(null);
    const [selectedUserStory, setSelectedUserStory] = useState<{
        _id: string;
        title?: string;
        description: string;
    } | null>(null);

    useEffect(() => {
        const resolveParams = async () => {
            const params = await paramsPromise;
            setShareId(params.shareId);
        };
        resolveParams();
    }, [paramsPromise]);

    const projectDetails = useQuery(api.shareLink.getProjectByShareId, {
        shareId: shareId!
    });

    const handleSelectEntity = (entity: Entity) => {
        setSelectedEntity(entity);
        if (entity.type === 'section' && entity.subitems && entity.subitems.length > 0) {
            setSelectedWorkItem(entity.subitems[0] as { id: string; title: string; content: string });
        }
    };

    const scrollToItem = (itemId: string) => {
        const element = document.getElementById(itemId);
        const contentContainer = document.querySelector('.overflow-y-auto');
        
        if (element && contentContainer) {
            const elementRect = element.getBoundingClientRect();
            const containerRect = contentContainer.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top + contentContainer.scrollTop;
            
            contentContainer.scrollTo({
                top: relativeTop - 32, // Adding some top padding
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (projectDetails) {
            const entities: Entity[] = [
                {
                    id: 'overview',
                    title: 'Epic Overview',
                    content: projectDetails.project.overview,
                    type: 'overview',
                    icon: Home
                },
                {
                    id: 'functionalRequirements',
                    title: 'Functional Requirements',
                    type: 'section',
                    icon: FileText,
                    subitems: projectDetails.functionalRequirements.map(req => ({
                        id: req._id,
                        title: `${req.title || req._id}`,
                        content: req.description,
                        type: 'requirement',
                        icon: FileText
                    }))
                },
                {
                    id: 'useCases',
                    title: 'Use Cases',
                    type: 'section',
                    icon: GitPullRequest,
                    subitems: projectDetails.useCases.map(useCase => ({
                        id: useCase._id,
                        title: `${useCase.title || useCase._id}`,
                        content: useCase.description,
                        type: 'useCase',
                        icon: GitPullRequest
                    }))
                },
                {
                    id: 'epics',
                    title: 'Features & User Stories',
                    type: 'section',
                    icon: Layers,
                    subitems: projectDetails.epics.map(epic => ({
                        id: epic._id,
                        title: epic.name,
                        content: epic.description,
                        type: 'epic',
                        icon: Layers,
                        userStories: epic.userStories
                    }))
                }
            ];
            setMappedEntities(entities);
            if (!selectedEntity && entities.length > 0) {
                setSelectedEntity(entities[0]);
            }
        }
    }, [projectDetails, selectedEntity]);

    if (!projectDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col">
            <header className="w-full px-4 pt-4 bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{projectDetails.project.title}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">powered by</span>
                        <a 
                            href="https://mappie.ai" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:opacity-90 transition-opacity"
                        >
                            <img 
                                src="/Mappie.png" 
                                alt="Mappie" 
                                className="h-6 w-auto"
                            />
                        </a>
                    </div>
                </div>
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full justify-start">
                        {mappedEntities.map((entity) => (
                            <TabsTrigger 
                                key={entity.id} 
                                value={entity.id}
                                onClick={() => handleSelectEntity(entity)}
                                className="flex items-center gap-2"
                            >
                                {entity.icon && <entity.icon className="h-4 w-4" />}
                                {entity.title}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </header>

            <div className="flex flex-1 gap-3 px-4 pt-2 pb-4 overflow-hidden">
                {/* Sidebars */}
                <div className="flex gap-3">
                    {/* Features Sidebar */}
                    <div className="w-72">
                        <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-100 rounded-xl h-full">
                            <nav className="p-4 space-y-2">
                                {selectedEntity?.type === 'overview' ? (
                                    <div className="">
                                        <div className="text-sm font-semibold mb-3 flex items-center">
                                            Table of Contents
                                        </div>
                                        <Separator className="my-2" />
                                        <ScrollArea className="h-[calc(100vh-200px)]">
                                            <div className="space-y-1">
                                                {selectedEntity.content && extractHeadings(selectedEntity.content).map((heading) => (
                                                    <button
                                                        key={heading.id}
                                                        onClick={() => scrollToItem(heading.id)}
                                                        className={cn(
                                                            'transition-colors duration-150 text-left w-full rounded-lg hover:bg-slate-200',
                                                            heading.tag === 'h1' && 'text-lg p-2 font-semibold',
                                                            heading.tag === 'h2' && 'text-md ml-3 p-2 text-gray-700',
                                                            heading.tag === 'h3' && 'text-sm ml-6 p-2 text-gray-600',
                                                            heading.tag === 'h4' && 'text-xs ml-9 p-2 text-gray-500'
                                                        )}
                                                    >
                                                        <span className="truncate">{heading.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                ) : selectedEntity?.type === 'section' && selectedEntity.id === 'epics' ? (
                                    <div>
                                        <div className="text-sm font-semibold mb-3">Features</div>
                                        <Separator className="my-2" />
                                        <ScrollArea className="h-[calc(100vh-200px)]">
                                            <div className="space-y-1">
                                                {selectedEntity?.subitems?.map((feature) => (
                                                    <button
                                                        key={feature.id}
                                                        onClick={() => {
                                                            setSelectedWorkItem(feature as { id: string; title: string; content: string });
                                                            setSelectedUserStory(null);
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm hover:bg-slate-200",
                                                            selectedWorkItem?.id === feature.id && "bg-white font-medium"
                                                        )}
                                                    >
                                                        {feature.icon && <feature.icon className="h-4 w-4" />}
                                                        <span className="truncate" title={feature.title}>
                                                            {feature.title.length > 25 ? `${feature.title.slice(0, 25)}...` : feature.title}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                ) : (
                                    // Original section navigation content for non-epic sections
                                    <div>
                                        {selectedEntity?.subitems?.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    setSelectedWorkItem(item as { id: string; title: string; content: string });
                                                }}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm hover:bg-slate-200",
                                                    selectedWorkItem?.id === item.id && "bg-white font-medium"
                                                )}
                                            >
                                                {item.icon && <item.icon className="h-4 w-4" />}
                                                <span className="truncate">{item.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>

                    {/* User Stories Sidebar */}
                    {selectedEntity?.type === 'section' && selectedEntity.id === 'epics' && selectedWorkItem && (
                        <div className="w-72">
                            <div className="shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-slate-200 rounded-xl h-full">
                                <nav className="p-4 space-y-2">
                                    <div className="text-sm font-semibold mb-3">User Stories</div>
                                    <Separator className="my-2 bg-slate-300" />
                                    <ScrollArea className="h-[calc(100vh-200px)]">
                                        <div className="space-y-1">
                                            {(selectedWorkItem as any).userStories?.map((story: any) => (
                                                <button
                                                    key={story._id}
                                                    onClick={() => setSelectedUserStory(story)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 w-full text-left rounded-lg text-sm hover:bg-slate-100",
                                                        selectedUserStory?._id === story._id && "bg-white font-medium"
                                                    )}
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    <span className="truncate" title={story.title || 'Untitled Story'}>
                                                        {story.title 
                                                            ? story.title.length > 25 
                                                                ? `${story.title.slice(0, 25)}...` 
                                                                : story.title
                                                            : 'Untitled Story'
                                                        }
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] bg-white rounded-xl">
                    {selectedEntity && (
                        <div className="h-full overflow-y-auto [background-image:linear-gradient(to_bottom,white_0%,transparent_2%),linear-gradient(to_top,white_0%,transparent_2%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)] relative">
                            <div className="py-4 px-12">
                                <div className="text-foreground max-w-3xl">
                                    {selectedEntity.type === 'section' && (selectedWorkItem || selectedUserStory) && (
                                        <div key={selectedUserStory?._id || selectedWorkItem?.id} id={selectedUserStory?._id || selectedWorkItem?.id}>
                                            <h2 className="text-xl font-semibold mb-4 border-b">
                                                {selectedUserStory ? (selectedUserStory.title || 'Untitled Story') : selectedWorkItem?.title}
                                            </h2>
                                            <ReactMarkdown
                                                className="text-sm leading-relaxed break-words overflow-hidden max-w-full"
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({ node, ...props }) => (
                                                        <h1 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                            className="text-3xl font-bold mt-2 mb-6 border-b pb-2 scroll-mt-4" 
                                                            {...props} 
                                                        />
                                                    ),
                                                    h2: ({ node, ...props }) => (
                                                        <h2 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                            className="text-2xl font-bold mb-4 mt-6 scroll-mt-4" 
                                                            {...props} 
                                                        />
                                                    ),
                                                    h3: ({ node, ...props }) => (
                                                        <h3 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                            className="text-xl font-semibold mb-3 mt-4 scroll-mt-4" 
                                                            {...props} 
                                                        />
                                                    ),
                                                    h4: ({ node, ...props }) => (
                                                        <h4 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                            className="text-lg font-medium mb-2 mt-4 scroll-mt-4" 
                                                            {...props} 
                                                        />
                                                    ),
                                                    p: ({ node, ...props }) => (
                                                        <p className="text-gray-600 leading-relaxed" {...props} />
                                                    ),
                                                    ul: ({ node, ...props }) => (
                                                        <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                                                    ),
                                                    ol: ({ node, ...props }) => (
                                                        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                                                    ),
                                                    li: ({ node, ...props }) => (
                                                        <li className="leading-relaxed" {...props} />
                                                    ),
                                                    code: ({ node, ...props }) => (
                                                        <code className="bg-gray-100 text-pink-500 px-1 py-0.5 rounded text-sm" {...props} />
                                                    ),
                                                    blockquote: ({ node, ...props }) => (
                                                        <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-4" {...props} />
                                                    ),
                                                    pre: ({ node, ...props }) => (
                                                        <pre className="overflow-x-auto max-w-full p-4 bg-gray-100 rounded-lg mb-4" {...props} />
                                                    ),
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto max-w-full">
                                                            <table className="min-w-full" {...props} />
                                                        </div>
                                                    ),
                                                }}
                                            >
                                                {selectedUserStory ? selectedUserStory.description : (selectedWorkItem?.content || '')}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                    {selectedEntity.type === 'overview' && (
                                        <ReactMarkdown
                                            className="text-sm leading-relaxed break-words overflow-hidden max-w-full"
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                h1: ({ node, ...props }) => (
                                                    <h1 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                        className="text-3xl font-bold mb-6 border-b pb-2 scroll-mt-4" 
                                                        {...props} 
                                                    />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                        className="text-2xl font-bold mb-4 mt-6 scroll-mt-4" 
                                                        {...props} 
                                                    />
                                                ),
                                                h3: ({ node, ...props }) => (
                                                    <h3 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                        className="text-xl font-semibold mb-3 mt-4 scroll-mt-4" 
                                                        {...props} 
                                                    />
                                                ),
                                                h4: ({ node, ...props }) => (
                                                    <h4 id={`heading-${props.children?.toString().toLowerCase().replace(/\s+/g, '-')}`} 
                                                        className="text-lg font-medium mb-2 mt-4 scroll-mt-4" 
                                                        {...props} 
                                                    />
                                                ),
                                                p: ({ node, ...props }) => (
                                                    <p className="text-gray-600 leading-relaxed" {...props} />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600" {...props} />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li className="leading-relaxed" {...props} />
                                                ),
                                                code: ({ node, ...props }) => (
                                                    <code className="bg-gray-100 text-pink-500 px-1 py-0.5 rounded text-sm" {...props} />
                                                ),
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote className="border-l-4 border-gray-200 pl-4 italic text-gray-600 mb-4" {...props} />
                                                ),
                                                pre: ({ node, ...props }) => (
                                                    <pre className="overflow-x-auto max-w-full p-4 bg-gray-100 rounded-lg mb-4" {...props} />
                                                ),
                                                table: ({ node, ...props }) => (
                                                    <div className="overflow-x-auto max-w-full">
                                                        <table className="min-w-full" {...props} />
                                                    </div>
                                                ),
                                            }}
                                        >
                                            {selectedEntity.content || ''}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}