"use client";
import Link from "next/link";
import Logo from "@/app/(landing)/components-landing/ui/logo";
import Dropdown from "@/app/(landing)/components-landing/dropdown";
import MobileMenu from "@/app/(landing)/components-landing/ui/mobile-menu";
import {
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-2 z-30 w-full md:top-6">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-white/90 px-3 shadow-lg shadow-black/[0.03] backdrop-blur-sm before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(theme(colors.gray.100),theme(colors.gray.200))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)]">
          {/* Site branding */}
          <div className="flex w-32 items-center">
            <Logo />
          </div>

          {/* Desktop navigation */}
          <nav className="hidden flex-1 md:flex">
            {/* Desktop menu links */}
            <ul className="flex w-full flex-wrap items-center justify-center gap-4 text-sm lg:gap-8">
              <li className="px-3 py-1">
                <Link
                  href="/pricing"
                  className="flex items-center text-gray-700 transition hover:text-gray-900"
                >
                  Pricing
                </Link>
              </li>
              <li className="px-3 py-1">
                <Link
                  href="/customers"
                  className="flex items-center text-gray-700 transition hover:text-gray-900"
                >
                  Customers
                </Link>
              </li>
              <li className="px-3 py-1">
                <Link
                  href="/support"
                  className="flex items-center text-gray-700 transition hover:text-gray-900"
                >
                  Support center
                </Link>
              </li>
            </ul>
          </nav>

          {/* Desktop sign in links with Clerk */}
          {isSignedIn ? (
            <div className="w-32 flex items-center justify-end gap-x-6">
              <Button variant="default" className="h-7 md:h-7 lg:h-9" asChild>
                <Link href="/projects">Enter Mappie</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <ul className="w-32 flex items-center justify-end gap-3">
              <li>
                <SignInButton mode="modal" forceRedirectUrl={"/projects"}>
                  <Button 
                    variant="ghost" 
                    className="bg-white text-gray-800 shadow hover:bg-gray-50"
                  >
                    Login
                  </Button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton mode="modal" forceRedirectUrl={"/projects"}>
                  <Button 
                    className="bg-gray-800 text-gray-200 shadow hover:bg-gray-900"
                  >
                    Register
                  </Button>
                </SignUpButton>
              </li>
            </ul>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  );
} 