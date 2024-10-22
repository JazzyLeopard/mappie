"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  const { isSignedIn } = useUser();
  return (
    <section className="container grid place-items-center py-20 md:py-32 gap-10 max-w-[1100px]">
      <div className="text-center space-y-8">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span>From </span>
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              requirements
            </span>{" "}
            to
          </h1>{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              stories
            </span>
            , superfast.
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto">
          Let AI help you analyze your software project.
        </p>

        <div className="flex flex-wrap justify-center gap-6 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-gradient-to-r hover:from-[#F7B8E4] hover:to-[#6CCEF5] transition-colors" style={{ background: 'linear-gradient(to right, #F7B8E4, #6CCEF5)', padding: '2px' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-black">1</span>
              </div>
            </div>
            <span className="text-md font-medium">Requirements</span>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-gradient-to-r hover:from-[#F7B8E4] hover:to-[#6CCEF5] transition-colors" style={{ background: 'linear-gradient(to right, #F7B8E4, #6CCEF5)', padding: '2px' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-black">2</span>
              </div>
            </div>
            <span className="text-md font-medium">Analysis</span>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-gradient-to-r hover:from-[#F7B8E4] hover:to-[#6CCEF5] transition-colors" style={{ background: 'linear-gradient(to right, #F7B8E4, #6CCEF5)', padding: '2px' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-black">3</span>
              </div>
            </div>
            <span className="text-md font-medium">Epic</span>
          </div>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-gradient-to-r hover:from-[#F7B8E4] hover:to-[#6CCEF5] transition-colors" style={{ background: 'linear-gradient(to right, #F7B8E4, #6CCEF5)', padding: '2px' }}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-lg font-bold text-black">4</span>
              </div>
            </div>
            <span className="text-md font-medium">Story</span>
          </div>
        </div>

        {isSignedIn ? (
          <Button asChild>
            <Link href="/projects">
              Enter Projeqtly
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl={"/projects"}>
            <Button size="lg">
              Get started <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </SignInButton>
        )}
      </div>

      <div className="z-10">
        <div className="grid grid-cols-2 gap-6 mt-10 max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF80B5] to-[#9089FC] opacity-30 blur-3xl -z-10"></div>
          <div className="bg-white px-10 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow col-span-2 md:col-span-1 h-64">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#E7A8D4] to-[#5CBEE5] text-transparent bg-clip-text mb-4 px-2 py-2">1. Create a project</h3>
            <p className="text-muted-foreground text-sm text-left">
              Tell us what your project is about.
              The AI will remember, and use this information to analyse, research and generate stories for you.
            </p>
          </div>
          <div className="bg-white px-10 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow col-span-2 md:col-span-1 h-48 md:self-end">
            <h3 className="text-xl font-semibold mb-4 px-2 py-2 bg-gradient-to-r from-[#E7A8D4] to-[#5CBEE5] text-transparent bg-clip-text">2. Automatic Epic creation</h3>
            <p className="text-muted-foreground text-sm text-left">
              When the AI has enough context, it will automatically create epics.
            </p>
          </div>
          <div className="bg-white px-10 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow col-span-2 md:col-span-1 h-48">
            <h3 className="text-xl font-semibold bg-gradient-to-r py-2 from-[#E7A8D4] to-[#5CBEE5] text-transparent bg-clip-text mb-4">3. Help at every step</h3>
            <p className="text-muted-foreground text-sm text-left">
              Receive detailed analysis and insights about your project, including potential improvements and optimizations.
            </p>
          </div>
          <div className="bg-white px-10 py-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-shadow col-span-2 md:col-span-1 h-64">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-[#E7A8D4] to-[#5CBEE5] text-transparent bg-clip-text mb-4 px-2 py-2">4. Collaborate</h3>
            <p className="text-muted-foreground text-sm text-left">
              Work with your team to implement the insights and improve your project.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
