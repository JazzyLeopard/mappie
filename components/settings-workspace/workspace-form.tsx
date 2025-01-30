"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function WorkspaceForm() {
  const [name, setName] = useState("My Workspace");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    // Save to API
    console.log({ name, description });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your workspace..."
          className="h-40"
        />
      </div>

      <Button onClick={handleSave}>Save changes</Button>
    </div>
  );
}