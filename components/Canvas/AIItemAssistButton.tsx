'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  Lightbulb,
  MessageCircle
} from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { sendChatRequest } from '@/services/aiService'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const actions = [
  { key: 'suggestEdit', label: 'Suggest Edit', icon: Lightbulb },
  { key: 'critique', label: 'Critique', icon: MessageCircle }
]

interface AIItemAssistButtonProps {
  section: string
  sectionKey: string
  onExpandSidebar: () => void
  onDropdownStateChange: (isOpen: boolean) => void
}

export function AIItemAssistButton({ 
  section, 
  sectionKey, 
  onExpandSidebar,
  onDropdownStateChange 
}: AIItemAssistButtonProps) {
  const { sendMessage, isLoading, messages } = useChat()
  const { formData, canvasTheme, aiAgent } = useCanvas()

  const handleAction = async (action: string) => {
    onExpandSidebar()
    const actionMessage = action === 'question' 
      ? `Question me about ${section}` 
      : action === 'critique' 
      ? `Critique the ${section}` 
      : action === 'research' 
      ? `Research the ${section}` 
      : `Suggest things for ${section}`

    const message = {
      role: 'user',
      content: actionMessage,
    } as Message

    await sendMessage(message, action)
  }

  return (
    <DropdownMenu 
    onOpenChange={onDropdownStateChange}>
      <DropdownMenuTrigger 
        asChild
      >
        <Button 
          variant="outline"
          size="icon"
          canvasTheme={canvasTheme}
          className="ml-2"
        >
          <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        canvasTheme={canvasTheme}
        align="end" 
        className={`w-48`}
      >
        {actions.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem
            canvasTheme={canvasTheme}
            key={key}
            onClick={() => handleAction(key)}
            className={`cursor-pointer flex items-center gap-2`}

          >
            <Icon className={`h-4 w-4 ${
              canvasTheme === 'light'
                ? 'text-gray-600'
                : 'text-gray-400'
            }`} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 