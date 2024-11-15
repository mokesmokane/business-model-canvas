import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { SectionButtons } from './SectionButtons'
import { ActionButtons } from './ActionButtons'

interface ChatInputProps {
  input: string
  isLoading: boolean
  isExpanded: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onSectionSelect: (section: string | null) => void
  onActionSelect: (action: string) => void
}

export function ChatInput({ 
  input, 
  isLoading, 
  isExpanded,
  onInputChange, 
  onSend,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSend()
  }

  return (
    <div className="flex-shrink-0">
      
      <div className="p-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
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