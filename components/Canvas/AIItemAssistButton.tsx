'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Sparkles,
  Lightbulb,
  MessageCircle,
  ArrowRight
} from 'lucide-react'
import { createRequestSuggestEditMessage, createTextMessage, useChat } from '@/contexts/ChatContext'
import { useCanvas } from '@/contexts/CanvasContext'
import { SectionItem as SectionItemType } from '@/types/canvas'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AIItemAssistButtonProps {
  content: string
  item?: SectionItemType
  onExpandSidebar: () => void
  onDiveIn: () => void
  onDropdownStateChange: (isOpen: boolean) => void
}

export function AIItemAssistButton({ 
  content, 
  item,
  onExpandSidebar,
  onDiveIn,
  onDropdownStateChange 
}: AIItemAssistButtonProps) {
  const { sendMessage, isLoading } = useChat()
  const { canvasTheme } = useCanvas()

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
        ? createTextMessage(`Question me about ${content}`) 
        : action === 'critique' 
        ? createTextMessage(`Critique the ${content}`) 
        : action === 'suggestEdit' && item?.id
        ? createRequestSuggestEditMessage(`Suggest edits for...`, content, item?.id) 
        : createTextMessage(`Suggest things for ${content}`)


      await sendMessage(actionMessage, action)
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