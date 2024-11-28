import Header from '@/components/components-landing/ui/header'
import Footer from '@/components/components-landing/ui/footer'

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-grow pt-32"> {/* Add padding-top to account for fixed header */}
        {children}
      </main>
      <Footer />
    </div>
  )
}