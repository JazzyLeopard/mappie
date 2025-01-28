"use client"

import { CreateNewDoc } from "@/components/onboarding/create-new-doc";
import { PageTransition } from "@/components/transitions/page-transition";

export default function NewDocumentPage() {
  return (
    <PageTransition>
      <CreateNewDoc />
    </PageTransition>
  );
} 