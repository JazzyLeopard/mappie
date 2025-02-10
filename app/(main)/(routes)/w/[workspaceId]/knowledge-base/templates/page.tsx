"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGrid } from "@/components/ui/templates/TemplateGrid";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/default-scroll-area";
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
    <ScrollArea className="h-full flex flex-col">
      <div className="px-12 pt-6 space-y-2 sticky top-0 bg-background z-10">
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-muted-foreground py-2 pb-6">
          Pick a template to start creating your document.
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          window.location.hash = value;
        }}
        className="flex-1 flex flex-col pb-20"
      >
        <div className="px-12">
          <TabsList>
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="personal">Personal Templates</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 px-12 overflow-hidden">
          <TabsContent value="system" className="h-full mt-2">
            <ScrollArea className="h-full">
              <TemplateGrid
                workspaceId={workspaceId}
                templateSource="system"
                type="custom"
                columns={3}
              />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="personal" className="h-full mt-2">
            <ScrollArea className="h-full">
              <TemplateGrid
                workspaceId={workspaceId}
                templateSource="personal"
                type="custom"
                columns={3}
              />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </ScrollArea>
  );
}
