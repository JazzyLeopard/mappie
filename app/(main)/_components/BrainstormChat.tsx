/**
 * v0 by Vercel.
 * @see https://v0.dev/t/dL2h66oOLGg
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useMutation } from "@tanstack/react-query"
import ReactMarkdown from 'react-markdown'
import './markdown-styles.css'

// ... keep existing icon components ...

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function BrainstormChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm an AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", content: input }])
    mutation.mutate(input)
    setInput("")
  }

  return (
    <div className="flex flex-col h-[calc(500px-2.5rem)]">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] p-2 rounded-lg ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}>
                <ReactMarkdown className="text-xs prose dark:prose-invert max-w-none">
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="justify-center p-6 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 mr-2"
          />
          <Button type="submit" size="sm">Send</Button>
        </form>
      </div>
    </div>
  )
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}


function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}


function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}