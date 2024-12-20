"use client";

import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReactNode, useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Alert, AlertTitle } from "@chakra-ui/react";

interface ProjectProps {
  params: Promise<{
    projectId: Id<"projects">;
  }>;
  children: React.ReactNode;
}

export default function Layout({ params, children }: ProjectProps) {
  const [id, setId] = useState<Id<"projects"> | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setId(resolvedParams.projectId);
    };
    resolveParams();
  }, [params]);

  const projectTitle = useQuery(api.projects.getProjectNameById, {
    projectId: id!,
  });

  if (projectTitle === undefined || !id) {
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
