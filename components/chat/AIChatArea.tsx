'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createTextMessage, useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { useExpanded } from '@/contexts/ExpandedContext'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { useAIAgents } from '@/contexts/AIAgentContext'
import { useCanvasContext } from '@/contexts/ContextEnabledContext'

export function AIChatArea({ onClose }: { onClose?: () => void }) {

  const { messages, sendMessage, input, setInput, isLoading, createNewChat, interaction, setInteraction, setActiveTool, activeTool } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  const { isContextEnabled, setIsContextEnabled } = useCanvasContext()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { getAIAgent } = useAIAgents()
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    sendMessage(createTextMessage(input, 'user'))
  }

  const handleNewChat = () => {
    setSelectedCategory(null)
    createNewChat()
  }

  const handleAdminToolSelect = async (tool: string | null) => {
    setActiveTool(tool || '')
  }

  const handleActionMessage = async (action: {
    tool: string;
    section: string;
    message: string;
  }) => {
    console.log('action', action)
    setActiveTool(action.tool)
    setActiveSection(action.section)
    const userMessage = { 
        role: 'user', 
        content: action.message,
    } as Message;
    sendMessage(userMessage)
  };

  return (
    <>
          <div className="flex-shrink-0">
            <ChatHeader 
              isWide={isWide}
              onNewChat={handleNewChat}
              onChatHistory={() => setSelectedCategory('history')}
              onToggleWidth={()=>setIsWide(!isWide)}
              onClose={onClose}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatMessageList
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              onActionSelect={handleActionMessage}
              messages={messages}
              messagesEndRef={messagesEndRef}
              onAdminToolSelect={handleAdminToolSelect}
              activeTool={activeTool}
            />
          </div>
          <div className="flex-shrink-0">
            <ChatInput
              input={input}
              isExpanded={isExpanded}
              onSectionSelect={setActiveSection}
              onInputChange={setInput}
              onSend={handleSend}
              selectedInteraction={interaction}
              setSelectedInteraction={setInteraction}
            />
          </div>
        </>
  )
}