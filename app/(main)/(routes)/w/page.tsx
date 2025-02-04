'use client'
import Spinner from "@/components/ui/spinner";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WorkspacePage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.getWorkspaces);

  useEffect(() => {
    if (workspaces !== undefined) {
      if (!workspaces.length) {
        router.push("/onboarding");
      } else {
        router.push(`/w/${workspaces[0]._id}`);
      }
    }
  }, [workspaces, router]);

  return (
    <div className="pt-4 pr-4 pb-4 w-full h-screen">
      <div className="bg-white h-full rounded-xl flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    </div>
  );
} 