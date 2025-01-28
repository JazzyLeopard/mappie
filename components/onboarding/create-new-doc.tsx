import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, FileText, Sparkles, Plus } from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export function CreateNewDoc() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.getWorkspaces);
  const createDocument = useMutation(api.documents.createDocument);

  const handleCreateBlankDocument = async () => {
    if (!workspaces?.[0]?._id) return;
    
    const documentId = await createDocument({
      workspaceId: workspaces[0]._id,
      title: "Untitled Document",
      content: "",
      type: "document",
      metadata: {
        description: "",
        tags: []
      }
    }) as Id<"knowledgeBase">;

    // Redirect to the new document
    router.push(`/knowledge-base/documents/${documentId}?workspace=${workspaces[0]._id}`);
  };

  return (
    <div className="h-full bg-white rounded-lg p-4">
      <div className="container mx-auto px-4 py-12">
        {/* Main content */}
        <div className="mt-16 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create a new document
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Choose how you&apos;d like to create your document
          </p>

          {/* Cards Grid */}
          <div className="relative flex justify-center items-center gap-6 mt-8 px-4">
            {/* Use Template */}
            <Link href="#" className="w-full max-w-[280px] transform -rotate-3 transition-transform hover:-translate-y-1">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-pink-100">
                  <div className="absolute inset-0 opacity-50 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zAvuVlWQNWI5aCxXe0bIcdzozL79vz.png')] bg-contain bg-center bg-no-repeat" />
                </div>
                <CardContent className="relative bg-white/95 mt-32 p-6">
                  <h3 className="text-xl font-semibold mb-2">Use Template</h3>
                  <p className="text-sm text-gray-600 mb-8">
                    Start with a pre-built template for common document types
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            {/* Generate with AI */}
            <Link href="#" className="w-full max-w-[320px] z-10 transform transition-transform hover:-translate-y-1">
              <Card className="relative overflow-hidden border-2">
                <div className="absolute inset-0 bg-violet-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.violet.200)_0%,transparent_70%)]" />
                </div>
                <Badge className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  Recommended
                </Badge>
                <CardContent className="relative bg-white/95 mt-40 p-6">
                  <h3 className="text-2xl font-semibold mb-2">Generate with AI</h3>
                  <p className="text-sm text-gray-600 mb-8">
                    Describe what you need and let AI create your
                    <br />document in seconds
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </Link>

            {/* Start from blank */}
            <div onClick={handleCreateBlankDocument} className="w-full max-w-[280px] transform rotate-3 transition-transform hover:-translate-y-1 cursor-pointer">
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-violet-100">
                  <div className="absolute inset-0 opacity-50 bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-zAvuVlWQNWI5aCxXe0bIcdzozL79vz.png')] bg-contain bg-center bg-no-repeat" />
                </div>
                <CardContent className="relative bg-white/95 mt-32 p-6">
                  <h3 className="text-xl font-semibold mb-2">Start from blank</h3>
                  <p className="text-sm text-gray-600 mb-8">
                    Create a new document from scratch
                  </p>
                  <ArrowRight className="absolute bottom-4 right-4 w-5 h-5 text-gray-400" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

