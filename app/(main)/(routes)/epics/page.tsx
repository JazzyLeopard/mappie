"use client";

import AllProjects from "@/app/(main)/_components/layout/AllProjects";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import Empty from "@/public/empty.png";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { PlusIcon, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Spinner } from "@nextui-org/react";
import ProjectIdeation from "@/components/project-ideation";
import { SpokenLanguage } from "@/types";
import ProjectIdeationOptions from "@/app/(main)/_components/ProjectIdeationOptions";

const ProjectsPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(true);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    setShowMobileWarning(isMobile);
  }, []);

  if (!isSignedIn) {
    return <>Not signed in..</>;
  }

  const projects = useQuery(api.projects.getProjects);

  const createProject = useMutation(api.projects.createProject);

  const handleGenerateProject = async (description: string, language: SpokenLanguage) => {
    if (!description.trim()) {
      toast.error("Please enter an epic description.");
      return;
    }

    setIsGenerating(true);

    try {
      const projectId = await createProject({
        title: "Generating Epic...",
      });

      if (!projectId) {
        throw new Error("Failed to create epic");
      }

      toast.success("Epic created. Generating details...");

      const response = await fetch('/api/ideate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: description,
          projectId,
          language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate epic details');
      }
      
      await response.json(); // Wait for the response

      // Success handling
      toast.success("Epic details generated successfully!");
      setAiPrompt(""); // Reset the prompt

      // Navigate to the new project
      router.push(`/epics/${projectId}`);

    } catch (error: any) {
      console.error('Error generating epic:', error);
      toast.error(error.message || "Failed to generate epic. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onCreate = () => {
    const promise = createProject({
      title: "Untitled Project",
    });

    toast.promise(promise, {
      loading: "Creating new epic...",
      success: "New epic created",
      error: "Failed to create epic",
    });
  };

  const handleOptionSelect = (option: 'paste' | 'generate' | 'blank') => {
    switch (option) {
      case 'generate':
        // Open AI generation dialog
        // You can implement this logic
        break;
      case 'paste':
        // Handle paste option
        // You can implement this logic
        break;
      case 'blank':
        onCreate();
        break;
    }
  };

  if (projects === undefined) {
    return (
      <div className="pt-4 pr-4 pb-4 w-full h-screen">
        <div className="bg-white h-full rounded-xl flex items-center justify-center">
          <Spinner size={"lg"} />
        </div>
      </div>
    );
  }

  return (
    <>
      {showMobileWarning && (
        <div className="fixed inset-0 z-50 backdrop-blur-[60px] flex items-center justify-center p-4">
          <div className="bg-white/80 rounded-lg p-8 max-w-sm w-full space-y-6 shadow-lg">
            <h3 className="font-semibold text-xl text-center">Mobile Device Detected</h3>
            <p className="text-gray-600 text-center">
              Currently, Mappie.ai is only available on desktop. If you'd still like to use it, please continue by clicking "Continue".
            </p>
            <Button 
              className="w-full" 
              onClick={() => setShowMobileWarning(false)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
      <div className="pt-4 pr-4 pb-4 w-full h-screen">
        <div className={projects?.length === 0 ? "bg-white h-full rounded-xl flex flex-col items-center justify-center gap-6" : "bg-white h-full rounded-xl p-4"}>
          {(projects?.length ?? 0) > 0 ? (
            <AllProjects />
          ) : (
            <ProjectIdeationOptions onSelectOption={handleOptionSelect} />
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectsPage;
