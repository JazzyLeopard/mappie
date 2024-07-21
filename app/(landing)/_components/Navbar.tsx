"use client";

import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useConvexAuth } from "convex/react";

export const Navbar = () => {
  const { user, isSignedIn } = useUser();

  return (
    <>
      <div
        className={
          "border-b shadow-sm z-50 bg-background fixed top-0 justify-between items-center flex  w-full p-6"
        }
      >
        <Logo />

        {isSignedIn ? (
          <div className=" flex items-center gap-x-6">
            <Button variant="default" className="h-7 md:h-7 lg:h-9" asChild>
              <Link href="/projects">Enter Listoriq</Link>
            </Button>

            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
            <>
              <SignInButton mode="modal" forceRedirectUrl={"/projects"}>
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={"/projects"}>
                <Button size="sm">Register</Button>
              </SignUpButton>
            </>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
