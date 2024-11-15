'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, AlertTriangle, Shrink, Expand, HelpCircle, Zap, Search, MessageSquare } from 'lucide-react'
import AISuggestionItem from '@/components/chat/AISuggestionItem'
import { AIThinkingIndicator } from '@/components/ui/ai-thinking'
import { useCanvas } from '@/contexts/CanvasContext'
import ReactMarkdown from 'react-markdown'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'
import { SectionButtons } from './SectionButtons'
import { ActionButtons } from './ActionButtons'
import { sendChatRequest } from '@/services/aiService'
import { motion, AnimatePresence } from 'framer-motion'
import { useExpanded } from '@/contexts/ExpandedContext'
import { ChatHeader } from './ChatHeader'
import Item from './AIQuestionItem'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react'
import { Section } from '@/types/canvas'
import AIQuestionItem from './AIQuestionItem'
import { ChatInput } from './ChatInput'
import { ChatMessageList } from './ChatMessageList'


export function AIChatArea() {
  const { updateSection, updateQuestionAnswer, formData } = useCanvas()
  const { messages, addMessage, addMessages, input, setInput, isLoading, setIsLoading, clearMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
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
    <div className={`h-full flex flex-col ${isExpanded ? '' : 'items-center'}`}>
      {isExpanded ? (
        <>
          <div className="flex-shrink-0">
            <ChatHeader 
              isWide={isWide}
              onClearChat={handleClearChat}
              onToggleWidth={()=>setIsWide(!isWide)}
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