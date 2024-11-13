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
  const { formData, canvasTheme } = useCanvas()

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
      const formattedResponse: Message = {
        role: 'assistant',
        content: aiResponse.content || '',
        suggestions: aiResponse.suggestions?.map((suggestion: any) => ({
          id: suggestion.id,
          section: suggestion.section || sectionKey,
          suggestion: suggestion.suggestion,
          rationale: suggestion.rationale
        })),
        questions: aiResponse.questions?.map((question: any) => ({
          id: question.id,
          section: sectionKey,
          question: question.question,
          type: question.type || 'open',
          options: question.options || [],
          scale: question.scale || null
        }))
      }
      addMessages([...updatedMessages, formattedResponse])
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