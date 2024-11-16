"use client";

import Spinner from "@/components/ui/spinner";
import { useUser } from "@clerk/clerk-react";
import { useConvexAuth, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { api } from "@/convex/_generated/api";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useConvexAuth();
  const { user, isSignedIn } = useUser();

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center ">
        <Spinner size={"lg"} />
      </div>
    );
  }

  if (!isSignedIn) {
    return redirect("/");
  }

  return (
    <div className="flex h-[calc(100vh)] overflow-hidden bg-slate-200">
      <Navigation />
      <main className="overflow-y-hidden w-full">{children}</main>
    </div>
  );
};

export default MainLayout;
