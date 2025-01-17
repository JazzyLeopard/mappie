import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Get Started with Mappie",
  description: "Choose how you'd like to start creating your product documentation",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

