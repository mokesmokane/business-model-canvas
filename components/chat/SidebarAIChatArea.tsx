'use client'

import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'
import { useChat } from '@/contexts/ChatContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AIChatArea } from './AIChatArea'

export function SidebarAIChatArea() {
  const { messages, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { isExpanded, setIsExpanded, setIsWide } = useExpanded()
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className={`h-full flex flex-col ${isExpanded ? '' : 'items-center'}`}>
      {isExpanded ? (
        <AIChatArea />
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground"
              onClick={()=>{setIsExpanded(true); setIsWide(true)}}
            >
              <Bot className="h-5 w-5 text-muted-foreground" />
              <span className="sr-only">AI Assistant</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
            AI Assistant
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}