'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'

interface AIAssistButtonProps {
  section: string
  sectionKey: string
  onExpandSidebar: () => void
}

export function AIAssistButton({ section, sectionKey, onExpandSidebar }: AIAssistButtonProps) {
  const { setIsLoading, addMessages, isLoading, messages } = useChat()
  const { formData } = useCanvas()

  const handleSend = async () => {
      try {
        const currentMessages = [...messages.filter((m: Message) => m.role !== 'error')]
        const currentContent = formData

        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages.filter((m: Message) => m.role !== 'error')],
            currentContent: formData
          }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }));
            addMessages([...messages, { 
                role: 'error', 
                content: `Error: ${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}` 
            }]);
        } else {
            const data = await response.json();
            addMessages([...messages, { 
                role: 'assistant', 
                content: data.message,
                suggestions: data.suggestions 
            }]);
        }

      } catch (error) {
        const errorMessage = error instanceof Error 
            ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
            : String(error);
        
        addMessages([...messages, { 
            role: 'error', 
            content: `An error occurred:\n\n${errorMessage}` 
        }]);
      } 
  }

  const handleAIAssist = async () => {
    onExpandSidebar()
    const message = {
      role: 'user',
      content: `Please help me improve the ${section} section of my business model canvas`
    } as Message
    
    const updatedMessages = [...messages, message]
    
    await addMessages(updatedMessages)
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.filter((m: Message) => m.role !== 'error'),
          currentContent: formData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }));
        addMessages([...updatedMessages, { 
          role: 'error', 
          content: `Error: ${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}` 
        }]);
      } else {
        const data = await response.json();
        addMessages([...updatedMessages, { 
          role: 'assistant', 
          content: data.message,
          suggestions: data.suggestions 
        }]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
        : String(error);
      
      addMessages([...updatedMessages, { 
        role: 'error', 
        content: `An error occurred:\n\n${errorMessage}` 
      }]);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAIAssist}
      disabled={isLoading}
      variant="outline"
      size="icon"
      className="ml-2"
    >
      <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  )
} 