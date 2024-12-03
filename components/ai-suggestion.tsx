import React from 'react'
import { MessageSquare, Sparkles } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface AISuggestionProps {
  text: string
  projectName: string
}

export function AISuggestion({ text, projectName }: AISuggestionProps) {
  return (
    <div className="mt-4 bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="bg-gray-100 px-4 py-2 text-gray-800 text-sm font-medium border-b">
        {projectName}
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-grow">
            <div className="text-blue-600 text-sm font-medium">AI Suggestion:</div>
            <div className="mt-1 text-gray-800 text-sm">
              {text}
            </div>
          </div>
        </div>
        <div className="border-l-2 border-gray-300 pl-4">
          <pre className="text-gray-800 text-sm font-mono whitespace-pre-wrap">
            <code>
              # User Authentication
              <span className="bg-red-100">- Implement basic login system</span>
              <span className="bg-green-100">- Implement secure login system
              - Add two-factor authentication</span>
              - Create user roles and permissions
            </code>
          </pre>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm">
            Ignore
          </Button>
          <Button variant="default" size="sm">
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}

