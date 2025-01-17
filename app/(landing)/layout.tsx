import Header from '@/app/(landing)/components-landing/ui/header'
import Footer from '@/app/(landing)/components-landing/ui/footer'
import { AuroraBackground } from "@/components/ui/aurora-background";
import "@/app/globals.css";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuroraBackground className="relative min-h-screen w-full">
      <div className="flex min-h-screen flex-col relative z-10">
        <Header />
        <main className="flex-grow w-full">
          {children}
        </main>
        <Footer />
      </div>
    </AuroraBackground>
  )
}