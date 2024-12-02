import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, X } from 'lucide-react'
import { Interaction, useChat } from '@/contexts/ChatContext'

interface ChatInputProps {
  input: string
  isExpanded: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onSectionSelect: (section: string | null) => void
  selectedInteraction: Interaction | null
  setSelectedInteraction: (interaction: Interaction | null) => void
}

export function ChatInput({ 
  input, 
  isExpanded,
  onInputChange, 
  onSend,
  selectedInteraction,
  setSelectedInteraction
  }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend()
  }

  const { isLoading } = useChat()

  return (
    <div className="flex-shrink-0">
      
      <div className="p-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          {selectedInteraction && (
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setSelectedInteraction(null)}
            >
              {selectedInteraction.label}
              <X className="h-4 w-4" />
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={isExpanded ? "Type your message..." : "Chat..."}
            className="flex-grow bg-background border-input text-foreground placeholder:text-muted-foreground"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
} 