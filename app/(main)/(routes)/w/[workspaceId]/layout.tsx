"use client";

import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";

interface ProjectProps {
    params: Promise<{
        workspaceId: Id<"workspaces">;
    }>;
    children: React.ReactNode;
}

export default function Layout({ params, children }: ProjectProps) {
    const [id, setId] = useState<Id<"workspaces"> | null>(null);

    useEffect(() => {
        const resolveParams = async () => {
            const resolvedParams = await params;
            setId(resolvedParams.workspaceId);
        };
        resolveParams();
    }, [params]);

    const workspaceTitle = useQuery(api.workspaces.getWorkspaceNameById, {
        workspaceId: id!,
    });

    if (workspaceTitle === undefined || !id) {
        return (
            <div className="flex justify-center items-center mx-auto">
                <Spinner size={"lg"} />
            </div>
        );
    }
    return (
        <div className="pb-40">
            <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
                <div className="">{children}</div>
            </div>
        </div>
    );
}