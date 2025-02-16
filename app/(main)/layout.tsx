"use client";

import Spinner from "@/components/ui/spinner";
import { useUser } from "@clerk/clerk-react";
import { useConvex } from "convex/react";
import { redirect } from "next/navigation";
import { Navigation } from "./_components/navigation";
import { ErrorBoundary } from 'react-error-boundary';
import "@/app/globals.css"; 

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="text-gray-600">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const convex = useConvex();
  const { isSignedIn, isLoaded } = useUser();

  // Check if Convex is initialized
  if (!convex) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spinner size={"lg"} />
      </div>
    );
  }

  // Only redirect if we're sure the user isn't signed in
  if (!isSignedIn) {
    return redirect("/");
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="flex h-[calc(100vh)] overflow-hidden bg-slate-200">
        <Navigation />
        <main className="ml-3 overflow-y-hidden w-full">{children}</main>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
