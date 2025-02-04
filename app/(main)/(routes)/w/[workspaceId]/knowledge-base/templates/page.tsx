"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGrid } from "@/components/ui/templates/TemplateGrid";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TemplatesPageProps {
  params: Promise<{
    workspaceId: Id<"workspaces">
  }>
}

export default function TemplatesPage({ params }: TemplatesPageProps) {
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [activeTab, setActiveTab] = useState("system");
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setWorkspaceId(resolvedParams.workspaceId);
    };
    resolveParams();
  }, [params]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'system' || hash === 'personal') {
        setActiveTab(hash);
      }
    };

    // Set initial hash if none exists
    if (!window.location.hash) {
      window.location.hash = 'system';
    } else {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!workspaceId) return null;

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-12 flex">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-muted-foreground">
          Templates are used to generate content for your workspace.
        </p>
      </div>
      <div className="h-full flex-1 flex-col space-y-8 flex">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            window.location.hash = value;
          }}
        >
          <TabsList>
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="personal">Personal Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <TemplateGrid
              workspaceId={workspaceId}
              templateSource="system"
              type="custom"
            />
          </TabsContent>
          <TabsContent value="personal">
            <TemplateGrid
              workspaceId={workspaceId}
              templateSource="personal"
              type="custom"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}