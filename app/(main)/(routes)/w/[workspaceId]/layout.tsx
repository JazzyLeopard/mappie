"use client";

import { Id } from "@/convex/_generated/dataModel";

interface ProjectProps {
    params: Promise<{
        workspaceId: Id<"workspaces">;
    }>;
    children: React.ReactNode;
}

export default function Layout({ params, children }: ProjectProps) {
    return (
        <div className="pb-40">
            <div className="min-w-full md:max-w-3xl lg:max-w-4xl mx-auto">
                {children}
            </div>
        </div>
    );
}