import Header from '@/app/(landing)/components-landing/ui/header'
import Footer from '@/app/(landing)/components-landing/ui/footer'

import "@/app/globals.css";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}