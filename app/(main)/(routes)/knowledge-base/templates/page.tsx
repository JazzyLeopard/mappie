"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateGrid } from "@/components/ui/templates/TemplateGrid";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TemplatesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams?.get('tab');
  const workspaces = useQuery(api.workspaces.getWorkspaces);

  // Redirect to system tab if no tab is specified
  useEffect(() => {
    if (!tab) {
      router.push('/knowledge-base/templates?tab=system');
    }
  }, [tab, router]);

  // Don't render anything until we have workspace data
  if (!workspaces) {
    return <div>Loading...</div>;
  }

  const workspaceId = workspaces[0]?._id;

  return (
    <div className="h-full flex-1 flex-col space-y-6 p-12 flex">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-sm text-muted-foreground">Templates are used to generate content for your projects.</p>
      </div>
      <div className="h-full flex-1 flex-col space-y-8 flex">
        <Tabs defaultValue="system" value={tab || 'system'} onValueChange={(value) => router.push(`/knowledge-base/templates?tab=${value}`)}>
          <TabsList>
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="personal">Personal Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="system">
            <TemplateGrid workspaceId={workspaceId} templateSource="system" type="custom" />
          </TabsContent>
          <TabsContent value="personal">
            <TemplateGrid workspaceId={workspaceId} templateSource="personal" type="custom" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}