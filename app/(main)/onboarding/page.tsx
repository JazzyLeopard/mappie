"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OnboardingPage() {
  const router = useRouter();
  const initializeWorkspace = useMutation(api.workspaces.initializeWorkspace);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    projectType: "software",
    industry: "",
    objectives: [""],
    stakeholders: [""],
    startDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const workspaceId = await initializeWorkspace({
        name: formData.name,
        description: formData.description,
        projectType: formData.projectType as "software" | "hardware" | "service" | "other",
        metadata: {
          industry: formData.industry,
          objectives: formData.objectives.filter(o => o !== ""),
          stakeholders: formData.stakeholders.filter(s => s !== ""),
          timeline: {
            startDate: BigInt(new Date(formData.startDate).getTime()),
          }
        }
      });

      router.push(`/w/${workspaceId}`);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Your Project Workspace</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Project Name</label>
          <Input
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Description</label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block mb-2">Project Type</label>
          <Select
            value={formData.projectType}
            onValueChange={value => setFormData(prev => ({ ...prev, projectType: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add more form fields for industry, objectives, stakeholders, etc. */}

        <Button type="submit" className="w-full">
          Create Workspace
        </Button>
      </form>
    </div>
  );
} 