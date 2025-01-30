"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings2, Users2, Tags, Database } from "lucide-react";
import { WorkspaceForm } from "@/components/settings-workspace/workspace-form";
export default function WorkspaceSettingsPage() {
  return (
    <div className="bg-white rounded-lg w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8 flex items-center gap-2">
          <Settings2 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">Workspace Settings</h1>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users2 className="h-4 w-4" />
              Team & Access
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card className="p-6">
              <WorkspaceForm />
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card className="p-6">
              Team & Access
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <Card className="p-6">
              Configuration
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}