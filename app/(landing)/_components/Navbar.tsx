"use client";

import { Button } from "@/components/ui/button";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import Link from "next/link";
import { Logo } from "./Logo";

export const Navbar = () => {
  const { isSignedIn } = useUser();

  return (
    <>
      <div
        className={
          "border-b shadow-sm z-50 bg-background fixed top-0 w-full"
        }
      >
        <div className="mx-auto flex justify-between items-center px-12 h-16">
          <Logo />

          {isSignedIn ? (
            <div className="flex items-center gap-x-6">
              <Button variant="default" className="h-7 md:h-7 lg:h-9" asChild>
                <Link href="/projects">Enter Projeqtly</Link>
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
      </div>
    </>
  );
};

export default Navbar;
