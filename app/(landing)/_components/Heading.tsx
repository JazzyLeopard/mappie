"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";

import Link from "next/link";

export const Heading = () => {
  const { user, isSignedIn } = useUser();

  return (
    <div className="pt-20 max-w-3xl space-y-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semi-bold">
        Your Epics & Stories analysed. Superfast.
      </h1>

      <h1 className="pt-2 text-2xl font-semi-bold">
        Welcome to <span className=" font-[800]">Projeqtly</span>.
      </h1>

      <h3 className="pt-10 text-base sm:text-xl md:text-2xl font-medium">
        Projeqtly is the go-to tool for analysing Epics & Stories, with AI.
      </h3>

      {isSignedIn ? (
        <Button asChild>
          <Link href="/projects">
            Enter Projeqtly
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      ) : (
        <SignInButton mode="modal" forceRedirectUrl={"/projects"}>
          <Button size="sm">
            Log in <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignInButton>
      )}
    </div>
  );
};
