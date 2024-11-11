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
  const { setIsLoading, addMessages, isLoading, messages } = useChat()
  const { formData } = useCanvas()

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
      action: action
    } as Message

    const currentMessages = [...messages.filter((m: Message) => m.role == 'system' || m.role == 'user' || m.role == 'assistant')]
    const updatedMessages = [...currentMessages, message]
    
    await addMessages(updatedMessages)
    setIsLoading(true)
    try {
      const aiResponse = await sendChatRequest(updatedMessages, formData)
      addMessages([...updatedMessages, aiResponse as Message])
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
        : String(error)
      
      addMessages([...updatedMessages, { 
        role: 'error', 
        content: `An error occurred:\n\n${errorMessage}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu onOpenChange={onDropdownStateChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="icon"
          className="ml-2"
        >
          <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
        {actions.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onClick={() => handleAction(key)}
            className="text-gray-400 hover:bg-gray-800 hover:text-gray-100 cursor-pointer flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 