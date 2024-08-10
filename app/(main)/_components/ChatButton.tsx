import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import BrainstormChat from './BrainstormChat'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function BrainstormChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (buttonRef.current && isOpen) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      })
    }
  }, [isOpen])

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="h-4 w-4" />
        Brainstorm Chat
      </Button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 50,
          }}
          className="w-[400px] h-[500px] bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="bg-gray-100 p-2 flex justify-between items-center">
            <h2 className="text-sm font-semibold">Brainstorm Chat</h2>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Close</Button>
          </div>
          <QueryClientProvider client={queryClient}>
            <BrainstormChat />
          </QueryClientProvider>
        </div>
      )}
    </>
  )
}