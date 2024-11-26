'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useCanvas } from '@/contexts/CanvasContext'
import { AdminMessage, useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { sendAdminChatRequest, sendChatRequest } from '@/services/aiService'
import { useExpanded } from '@/contexts/ExpandedContext'
import { ChatHeader } from './ChatHeader'
import { AIAgent, Section } from '@/types/canvas'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'
import { useAuth } from '@/contexts/AuthContext'
import { CanvasTypeSuggestion, CanvasLayoutSuggestion } from '@/types/canvas-sections'
import { useAIAgents } from '@/contexts/AIAgentContext'
import { routeInteraction } from '@/services/interactionRouter'
import { useInteraction } from '@/contexts/InteractionCOntext'


export function AIChatArea({ onClose }: { onClose?: () => void }) {

  const { updateSection, updateQuestionAnswer, formData, aiAgent } = useCanvas()
  const { messages, addMessage, addMessages, input, setInput, isLoading, setIsLoading, setLoadingMessage, clearMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  const { isInTrialPeriod, userData } = useAuth()
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isContextEnabled, setIsContextEnabled] = useState(true)
  const { getAIAgent } = useAIAgents()
  const {interaction, setInteraction} = useInteraction()
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleAddSuggestion = (index: number, section: string, suggestion: string, rationale: string, suggestionId: string) => {
    const sectionData = formData.sections.get(section) as Section
    const currentItems = sectionData?.items || []
    const newItems = [...currentItems, `${suggestion}\n\n${rationale}`]
    
    updateSection(section, newItems)
    // handleRemoveSuggestion(index, suggestionId)
  }

  const handleSend = async () => {
    console.log('isInTrialPeriod', isInTrialPeriod)
    console.log('userData', userData)
    if (!isInTrialPeriod && (!userData?.subscriptionStatus || userData?.subscriptionPlan === 'free')) {
      addMessages([{ role: 'assistant', content: 'Your trial period has ended. Please upgrade to continue using AI features.' }])
      return
    }
    if(activeTool) {
      if(input.trim()) {
        const userMessage = { role: 'user', content: input, action: activeTool } as Message
        const updatedMessages = [...messages, userMessage]
        addMessages(updatedMessages)      
        setInput('')
        setIsLoading(true)

        try {
          const currentMessages = [...updatedMessages.filter((m: Message) => 
            m.role == 'system' || m.role == 'user' || m.role == 'assistant'
          )]
          const aiResponse = await sendAdminChatRequest([...currentMessages])
          const formattedResponse: AdminMessage = {
            role: 'assistant',
            content: aiResponse.content || '',
            canvasTypeSuggestions: aiResponse.canvasTypeSuggestions?.map((suggestion: any) => ({
              id: suggestion.id,
              name: suggestion.name,
              icon: suggestion.icon,
              description: suggestion.description,
              defaultLayout: suggestion.defaultLayout,
              sections: suggestion.sections,
              rationale: suggestion.rationale
            } as CanvasTypeSuggestion)),
            canvasLayoutSuggestions: aiResponse.canvasLayoutSuggestions?.map((suggestion: any) => ({
              gridTemplate: {
                columns: suggestion.gridTemplate.columns,
                rows: suggestion.gridTemplate.rows
              },
              areas: suggestion.areas,
              rationale: suggestion.rationale
            } as CanvasLayoutSuggestion))
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
    }
    else if (input.trim()) {
      const userMessage = { role: 'user', content: input } as Message
      const updatedMessages = [...messages, userMessage]
      addMessages(updatedMessages)      
      setInput('')
      setIsLoading(true)

      try {
        const currentMessages = [...updatedMessages.filter((m: Message) => 
          m.role == 'system' || m.role == 'user' || m.role == 'assistant'
        )]
        const send = interaction ? routeInteraction(interaction, currentMessages, formData, aiAgent) : sendChatRequest
      
        const aiResponse = send([...currentMessages], formData, aiAgent)
        for await (const message of aiResponse) {
          if(message.role === 'thinking') {
            setLoadingMessage(message.content)
          }
          else {
            addMessages([...updatedMessages, message])
          }
        }
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
  }

  const handleDismiss = (index: number, suggestionId: string) => {
    // handleRemoveSuggestion(index, suggestionId)
  }

  const handleExpand = async (suggestion: { suggestion: string }) => {
    const expandMessage = `Tell me more about "${suggestion.suggestion}"`
    setInput('')
    setIsLoading(true)

    try {
      const userMessage = { role: 'user', content: 'Tell me more' } as Message
      const currentMessages = [...messages.filter((m: Message) => m.role == 'system' || m.role == 'user' || m.role == 'assistant')]
      addMessages([...currentMessages, userMessage])
      if(!aiAgent) {
        throw new Error('No AI agent found')
      }
      const aiResponse = sendChatRequest([...currentMessages, { role: 'user', content: expandMessage }], formData, aiAgent)
      for await (const message of aiResponse) {
        addMessages([...messages, message])
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
        : String(error)
      
      addMessages([...messages, { 
        role: 'error', 
        content: `An error occurred:\n\n${errorMessage}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }
  const handleChipClick = (action: string) => {
    
  }
  
  const handleQuestionSubmit = (action: string) => {
    let message = {
      action: action,
      section: activeSection
    }
    handleActionMessage(message)
  }

  const handleActionMessage = async (action: any) => {
    const actionMessage = typeof action === 'string' 
      ? action 
      : action.message;

    const userMessage = { 
      role: 'user', 
      content: actionMessage,
      action: typeof action === 'string' ? action : action.action,
      section: typeof action === 'string' ? null : action.section
    } as Message;

    const currentMessages = [...messages.filter((m: Message) => 
      m.role === 'system' || m.role === 'user' || m.role === 'assistant'
    )];
    const updatedMessages = [...currentMessages, userMessage];
    
    addMessages(updatedMessages);
    setIsLoading(true);

    try {
      if(!aiAgent) {
        throw new Error('No AI agent found')
      }
      const aiResponse = await sendChatRequest(updatedMessages, formData, aiAgent);
      for await (const message of aiResponse) {
        addMessages([...updatedMessages, message]);
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
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    clearMessages()
  }

  const handleAdminToolSelect = async (tool: string | null) => {
    setActiveTool(tool)
  }

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
              selectedInteraction={interaction}
              setSelectedInteraction={setInteraction}
              messages={messages}
              onSuggestionAdd={handleAddSuggestion}
              onSuggestionDismiss={handleDismiss}
              onSuggestionExpand={handleExpand}
              onQuestionSubmit={updateQuestionAnswer}
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