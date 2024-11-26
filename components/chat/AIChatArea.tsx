'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useCanvas } from '@/contexts/CanvasContext'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { sendChatRequest } from '@/services/aiService'
import { useExpanded } from '@/contexts/ExpandedContext'
import { ChatHeader } from './ChatHeader'
import { Section } from '@/types/canvas'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { useAuth } from '@/contexts/AuthContext'
import { useAIAgents } from '@/contexts/AIAgentContext'


export function AIChatArea({ onClose }: { onClose?: () => void }) {

  const { messages, sendMessage, input, setInput, isLoading, clearMessages, interaction, setInteraction, setActiveTool, activeTool } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  const [isContextEnabled, setIsContextEnabled] = useState(true)
  const { getAIAgent } = useAIAgents()
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    sendMessage({
      role: 'user',
      content: input
    })
  }

    const handleClearChat = () => {
    clearMessages()
  }

  const handleAdminToolSelect = async (tool: string | null) => {
    setActiveTool(tool || '')
  }

  const handleActionMessage = async (action: any) => {
    const actionMessage = typeof action === 'string' 
        ? action 
        : action.message;
    setActiveTool(action.tool)
    setActiveSection(action.section)
    const userMessage = { 
        role: 'user', 
        content: actionMessage,
    } as Message;
    sendMessage(userMessage)
  };

  return (
    <>
          <div className="flex-shrink-0">
            <ChatHeader 
              isContextEnabled={isContextEnabled}
              onToggleContext={() => setIsContextEnabled(!isContextEnabled)}
              isWide={isWide}
              onClearChat={handleClearChat}
              onToggleWidth={()=>setIsWide(!isWide)}
              onClose={onClose}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatMessageList
              useCanvasContext={isContextEnabled}
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
              onActionSelect={handleActionMessage}
              onInputChange={setInput}
              onSend={handleSend}
              selectedInteraction={interaction}
              setSelectedInteraction={setInteraction}
            />
          </div>
        </>
  )
}