"use client";

import AllProjects from "@/app/(main)/_components/AllProjects";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { api } from "@/convex/_generated/api";
import Empty from "@/public/empty.png";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { PlusIcon, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ProjectsPage = () => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);


  if (!isSignedIn) {
    return <>Not signed in..</>;
  }
  const projects = useQuery(api.projects.getProjects);

  const createProject = useMutation(api.projects.createProject);

  const handleGenerateProject = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a project description.");
      return;
    }

    setIsGenerating(true);
    try {
      // Phase 1: Create the project with only a title
      const projectId = await createProject({
        title: "New AI Generated Project",
      });

      toast.success("Project created. Generating details...");

      // Navigate to the new project
      router.push(`/projects/${projectId}`);

      // Phase 2: Generate and populate project details
      const response = await fetch('/api/ideate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt, projectId }),
      });


      if (!response.ok) {
        throw new Error('Failed to generate project details');
      }
      else {
        console.log("Ideate response:", response);
      }

      toast.success("Project details generated successfully!");
    } catch (error) {
      console.error('Error generating project:', error);
      toast.error("Failed to generate project. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onCreate = () => {
    const promise = createProject({
      title: "Untitled Project",
    });

    toast.promise(promise, {
      loading: "Creating new project...",
      success: "New project created",
      error: "Failed to create project",
    });
  };

  return (
    <>
      <div className={projects?.length === 0 ? "flex flex-col items-center justify-center gap-6 h-full w-full" : "flex flex-col px-16 items-start overflow-y-auto max-h-screen"}>
        {(projects?.length ?? 0) > 0 ? (
          <AllProjects />
        ) : (
          <>
            {/* <h1 className="text-3xl font-semibold mb-8">
              {user?.firstName || user?.primaryEmailAddress?.emailAddress.split("@")[0]}
              &apos;s space
            </h1> */}

            <h2 className="text-2xl font-semibold mb-4">
              You haven't created any projects...
            </h2>

            <Image src={Empty} alt="documents" width={100} height={100} />

            <p className="text-gray-700">Click on "Create New" or "Ideate with AI" to get started</p>


            <div className="flex justify-center gap-4 mb-6">
              <Button variant="outline" className="flex items-center" onClick={onCreate}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create New
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="default" className="bg-gradient-to-r from-pink-500 to-blue-500 text-white flex items-center">
                    <Wand2 className="mr-2 w-4 h-4" />
                    Ideate with AI
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="min-w-96">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Describe the type of project/product/app/feature you want to create. Projeqtly will generate a project with populated fields as a starting point for you to build upon."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleGenerateProject} className="w-full" disabled={isGenerating}>
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
