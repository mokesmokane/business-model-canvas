'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  Lightbulb,
  MessageCircle,
  ArrowRight
} from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { sendChatRequest } from '@/services/aiService'
import { ConfirmDiveInDialog } from './ConfirmDiveInDialog'
import { SectionItem as SectionItemType } from '@/types/canvas'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AIItemAssistButtonProps {
  sectionName: string
  item?: SectionItemType
  onExpandSidebar: () => void
  onDiveIn: () => void
  onDropdownStateChange: (isOpen: boolean) => void
}

export function AIItemAssistButton({ 
  sectionName, 
  item,
  onExpandSidebar,
  onDiveIn,
  onDropdownStateChange 
}: AIItemAssistButtonProps) {
  const { sendMessage, isLoading, messages } = useChat()
  const { formData, canvasTheme, loadCanvas } = useCanvas()

  const actions = [
    { key: 'suggestEdit', label: 'Suggest Edit', icon: Lightbulb },
    { key: 'critique', label: 'Critique', icon: MessageCircle },
    { key: 'diveIn', label: item?.canvasLink ? 'Open Canvas Link' : 'Dive In', icon: ArrowRight },
  ]
  
    const handleAction = async (action: string) => {
    if (action === 'diveIn') {
        onDiveIn()
    } else {
      onExpandSidebar()
      const actionMessage = action === 'question' 
        ? `Question me about ${sectionName}` 
        : action === 'critique' 
        ? `Critique the ${sectionName}` 
        : action === 'research' 
        ? `Research the ${sectionName}` 
        : `Suggest things for ${sectionName}`

      const message = {
        role: 'user',
        content: actionMessage,
      } as Message

      await sendMessage(message, action)
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