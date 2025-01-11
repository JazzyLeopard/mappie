'use client'
import { EntityNav } from "@/components/entityNav";
import { SidePanel } from "@/components/sidePanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import { Entity } from "@/lib/types";
import { useQuery } from "convex/react";
import { SquareArrowOutUpRightIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PageProps {
    params: Promise<{
        shareId: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function SharePage({ params: paramsPromise }: PageProps) {
    const [shareId, setShareId] = useState<string | null>(null);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [mappedEntities, setMappedEntities] = useState<Entity[]>([]);

    useEffect(() => {
        const resolveParams = async () => {
            const params = await paramsPromise;
            setShareId(params.shareId);
        };
        resolveParams();
    }, [paramsPromise]);

    // Then get project details using the projectId
    const projectDetails = useQuery(api.shareLink.getProjectByShareId, {
        shareId: shareId!
    });

    console.log(projectDetails)

    const handleSelectEntity = (entity: Entity) => {
        setSelectedEntity(entity);
        setIsOpen(true);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    useEffect(() => {
        if (projectDetails) {
            const entities: Entity[] = [
                // Project Overview
                {
                    id: 'overview',
                    title: 'Epic Overview',
                    content: projectDetails.project.overview,
                    type: 'overview'
                },
                // Functional Requirements Section
                {
                    id: 'functionalRequirements',
                    title: 'Functional Requirements',
                    type: 'section',
                    subitems: projectDetails.functionalRequirements.map(req => ({
                        id: req._id,
                        title: `${req.title || req._id}`,
                        content: req.description,
                        type: 'requirement'
                    }))
                },
                // Use Cases Section
                {
                    id: 'useCases',
                    title: 'Use Cases',
                    type: 'section',
                    subitems: projectDetails.useCases.map(useCase => ({
                        id: useCase._id,
                        title: `${useCase.title || useCase._id}`,
                        content: useCase.description,
                        type: 'useCase'
                    }))
                },
                // Epics Section
                {
                    id: 'epics',
                    title: 'Features',
                    type: 'section',
                    subitems: projectDetails.epics.map(epic => ({
                        id: epic._id,
                        title: epic.name,
                        content: epic.description,
                        type: 'epic',
                        userStories: epic.userStories
                    }))
                }
            ];
            setMappedEntities(entities);
        }
    }, [projectDetails]);

    if (!projectDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex h-screen gap-2 p-6">
            <div className="flex flex-1 gap-2">
                <div className="flex-1 shadow-[0_0_2px_rgba(0,0,0,0.1)] pt-4 px-2 bg-white rounded-xl flex flex-col min-w-[50%] relative">
                    <h1 className="text-2xl font-bold mb-4 px-4 flex items-center gap-2">
                        {projectDetails.project.title}
                        <SquareArrowOutUpRightIcon className="w-6 h-6" />
                    </h1>
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                        <div className="px-6 py-8">
                            <EntityNav
                                entities={mappedEntities}
                                selectedEntity={selectedEntity}
                                onSelectEntity={handleSelectEntity}
                            />
                        </div>
                    </ScrollArea>
                </div>
                <SidePanel
                    isOpen={isOpen}
                    entity={selectedEntity}
                    onClose={handleClose}
                />
            </div>
        </div>
    );
}