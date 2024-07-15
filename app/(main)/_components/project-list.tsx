'use client'

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Item from './item'
import { useRouter } from "next/navigation";

interface projectLitsProps {
    parenProjectId?: Id<"projects">;
    level?: number;
    data?: Doc<"projects">[]
}

export const ProjectList = ({
    parenProjectId,
    level = 0,
    data
}: projectLitsProps) => {
    const params = useParams()
    const router = useRouter()
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    const onExpand = (projectId: string) => {
        setExpanded(prevExpanded => ({
            ...prevExpanded,
            [projectId]: !prevExpanded[projectId]
        }))
    };

    if (data === undefined) {
        return (
            <>
                <Item level={level} icon={null} />
                {level === 0 && (
                    <>
                        <Item level={level} icon={null} />
                        <Item level={level} icon={null} />
                    </>
                )}

            </>
        )
    }

    // const onRedirect = (projectId: string) => {
    //     router.push(`/projects/${projectId}`)
    // }

    const navigateToProject = (id: string, onboardingStatus: number) => {
        if (onboardingStatus != 0) {
            router.push(`/projects/${id}/onboarding`)
            return
        }
        router.push(`/projects/${id}`)
    }

    return (
        <>
            <p
                style={{
                    paddingLeft: level ? `${(level * 12) + 25}px` : undefined,
                    textAlign: 'center'
                }}
                className={cn(
                    "hidden text-sm font-medium text-muted-foreground/80",
                    expanded && "last:block",
                    level === 0 && "hidden"
                )}
            >
                No Projects Found
            </p>
            {data.map((project) => (
                <div key={project._id}>
                    <Item
                        id={project._id}
                        onClick={() => navigateToProject(project._id, project.onboarding)}
                        // onClick={() => onRedirect(project._id)}
                        label={project.title}
                        icon={null}
                        active={params?.documentId === project._id}
                        level={level}
                        onExpand={() => onExpand(project._id)}
                        expanded={expanded[project._id]}
                    />
                    {/* {expanded[project._id] && (
                        <ProjectList
                            parenProjectId={project._id}
                            level={level + 1}
                        />
                    )} */}
                </div>
            ))}
        </>
    )
}