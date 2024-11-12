'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  Lightbulb,
  HelpCircle,
  MessageCircle,
  Search
} from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { sendChatRequest } from '@/services/aiService'
import { useCanvasTheme } from '@/contexts/CanvasThemeContext'

const actions = [
  { key: 'suggest', label: 'Suggest', icon: Lightbulb },
  { key: 'question', label: 'Question Me', icon: HelpCircle },
  { key: 'critique', label: 'Critique', icon: MessageCircle },
  { key: 'research', label: 'Research', icon: Search },
]

interface AISectionAssistButtonProps {
  section: string
  sectionKey: string
  onExpandSidebar: () => void
}

export function AISectionAssistButton({ section, sectionKey, onExpandSidebar }: AISectionAssistButtonProps) {
  const { setIsLoading, addMessages, isLoading, messages } = useChat()
  const { formData } = useCanvas()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { canvasTheme } = useCanvasTheme()

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
    <div 
      className="relative"
      onMouseEnter={() => setIsDropdownOpen(true)}
      onMouseLeave={() => setIsDropdownOpen(false)}
    >
      <Button 
        variant="outline"
        size="icon"
        canvasTheme={canvasTheme}
        className="ml-2 hover:bg-gray-800/50 hover:text-gray-100 group"
        disabled={isLoading}
      >
        <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>

      <div className={`
        absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-900 border border-gray-800
        transform transition-all duration-200 ease-in-out origin-top-right z-50
        ${isDropdownOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
      `}>
        <div className="absolute -top-2 right-0 h-2 w-full" />
        <div className="py-1">
          {actions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleAction(key)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 

export default AISectionAssistButton