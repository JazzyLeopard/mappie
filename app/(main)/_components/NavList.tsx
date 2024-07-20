'use client'

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import NavItem from "./NavItem";

interface projectLitsProps {
    parentId?: Id<"projects"> | Id<"epics">;
    level?: number;
    data?: any
}

export const NavList = ({
    parentId,
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
                <NavItem level={level} icon={null} />
                {level === 0 && (
                    <>
                        <NavItem level={level} icon={null} />
                    </>
                )}

            </>
        )
    }

    const navigateToProject = (id: string, onboardingStatus: number) => {
        if (onboardingStatus != 0) {
            router.push(`/projects/${id}/onboarding`)
            return
        }
        router.push(`/projects/${id}`)
    }

    const navigateToItem = (data: any) => {
        // Project navigation
        if (level == 0) {
            if (data?.onboarding && data?.onboarding != 0) {
                router.push(`/projects/${data._id}/onboarding`)
                return
            }
            router.push(`/projects/${data._id}/overview`)
        }
        // Epic navigation
        else if (level == 1) {
            router.push(`/projects/${parentId}/epics/${data._id}`)
        }1
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
                {level === 0 && 'No Projects Found'}
                {level === 1 && 'No Epics Found'}
                {level === 2 && 'No User Stories Found'}
            </p>
            {data.map((project: any) => (
                <div key={project._id}>
                    <NavItem
                        key={project._id}
                        id={project._id}
                        onClick={() => navigateToItem(project)}
                        // onClick={() => onRedirect(project._id)}
                        label={project.title}
                        icon={null}
                        active={params?.documentId === project._id}
                        level={level}
                        onExpand={() => onExpand(project._id)}
                        expanded={expanded[project._id]}
                    />
                    {expanded[project._id] && (
                        <NavList
                            parentId={project._id}
                            level={level + 1}
                            data={project.epics}
                        />
                    )}
                </div>
            ))}
        </>
    )
}