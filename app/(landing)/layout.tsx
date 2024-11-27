"use client";

import { useEffect } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import AOS from "aos";
import "aos/dist/aos.css";

import Header from "@/components/components-landing/ui/header";
import Footer from "@/components/components-landing/ui/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    AOS.init({
      once: true,
      disable: "phone",
      duration: 700,
      easing: "ease-out-cubic",
    });
  });

  return (
    <div className="h-full">
      <Navbar />
      <main>{children}</main>
    </div>
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <Header />
      <main className="grow">{children}</main>
      <Footer border={true} />
    </ClerkProvider>
  );
}
