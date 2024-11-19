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


export function AIChatArea({ onClose }: { onClose?: () => void }) {

  const { updateSection, updateQuestionAnswer, formData } = useCanvas()
  const { messages, addMessage, addMessages, input, setInput, isLoading, setIsLoading, clearMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  const { isInTrialPeriod, userData } = useAuth()
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

  // const handleRemoveSuggestion = (index: number, suggestionId: string) => {
  //   let updatedMessage = {...messages[index],
  //     suggestions: messages[index]?.suggestions?.filter((s: any) => s.id !== suggestionId)
  //   }
  //   const updatedMessages = [...messages.slice(0, index), updatedMessage, ...messages.slice(index + 1)]
  //   addMessages(updatedMessages)
  // }

  const handleSend = async () => {
    if (!isInTrialPeriod && (!userData?.subscriptionStatus || userData?.subscriptionPlan === 'free')) {
      addMessages([{ role: 'assistant', content: 'Your trial period has ended. Please upgrade to continue using AI features.' }])
      return
    }
    if (input.trim()) {
      const userMessage = { role: 'user', content: input } as Message
      const updatedMessages = [...messages, userMessage]
      addMessages(updatedMessages)      
      setInput('')
      setIsLoading(true)

      try {
        const currentMessages = [...updatedMessages.filter((m: Message) => 
          m.role == 'system' || m.role == 'user' || m.role == 'assistant'
        )]
        const aiResponse = await sendChatRequest([...currentMessages], formData)
        const formattedResponse: Message = {
          role: 'assistant',
          content: aiResponse.content || '',
          suggestions: aiResponse.suggestions?.map((suggestion: any) => ({
            id: suggestion.id,
            section: suggestion.section || activeSection,
            suggestion: suggestion.suggestion,
            rationale: suggestion.rationale
          })),
          questions: aiResponse.questions?.map((question: any) => ({
            id: question.id,
            question: question.question,
            section: question.section || activeSection,
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

      const aiResponse = await sendChatRequest([...currentMessages, { role: 'user', content: expandMessage }], formData)
      const formattedResponse: Message = {
        role: 'assistant',
        content: aiResponse.content || '',
        suggestions: aiResponse.suggestions?.map((suggestion: any) => ({
          id: suggestion.id,
          section: suggestion.section || activeSection,
          suggestion: suggestion.suggestion,
          rationale: suggestion.rationale
        })),
        questions: aiResponse.questions?.map((question: any) => ({
          id: question.id,
          question: question.question,
          section: question.section || activeSection,
          type: question.type || 'open',
          options: question.options || [],
          scale: question.scale || null
        }))
      }
      addMessages([...messages, formattedResponse])
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
      const aiResponse = await sendChatRequest(updatedMessages, formData);
      const formattedResponse: Message = {
        role: 'assistant',
        content: aiResponse.content || '',
        suggestions: aiResponse.suggestions?.map((suggestion: any) => ({
          id: suggestion.id,
          section: suggestion.section || action.section,
          suggestion: suggestion.suggestion,
          rationale: suggestion.rationale
        })),
        questions: aiResponse.questions?.map((question: any) => ({
          id: question.id,
          question: question.question,
          section: action.section,
          type: question.type || 'open',
          options: question.options || [],
          scale: question.scale || null
        }))
      };
      addMessages([...updatedMessages, formattedResponse]);
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

  return (
    <>
          <div className="flex-shrink-0">
            <ChatHeader 
              isWide={isWide}
              onClearChat={handleClearChat}
              onToggleWidth={()=>setIsWide(!isWide)}
              onClose={onClose}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <ChatMessageList
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              onActionSelect={handleActionMessage}
              messages={messages}
              isLoading={isLoading}
              onSuggestionAdd={handleAddSuggestion}
              onSuggestionDismiss={handleDismiss}
              onSuggestionExpand={handleExpand}
              onQuestionSubmit={(question) => {
                updateQuestionAnswer(question.section, question)
              }}
              messagesEndRef={messagesEndRef}
            />
          </div>
          <div className="flex-shrink-0">
            <ChatInput
              input={input}
              isLoading={isLoading}
              isExpanded={isExpanded}
              onSectionSelect={setActiveSection}
              onActionSelect={handleActionMessage}
              onInputChange={setInput}
              onSend={handleSend}
            />
          </div>
        </>
  )
}