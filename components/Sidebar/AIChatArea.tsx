'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, AlertTriangle, Shrink, Expand } from 'lucide-react'
import AISuggestionItem from '@/components/Sidebar/AISuggestionItem'
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
import AIQuestionItem from './AIQuestionItem'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'


export function AIChatArea() {
  const { updateSection, formData } = useCanvas()
  const { messages, addMessage, addMessages, input, setInput, isLoading, setIsLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { isExpanded, isWide, setIsExpanded, setIsWide } = useExpanded()
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleAddSuggestion = (index: number, section: string, suggestion: string, rationale: string, suggestionId: string) => {
    const currentItems = (formData[section as keyof typeof formData] as string[]) || []
    const newItems = [...currentItems, `${suggestion}\n\n${rationale}`]
    console.log(`Adding suggestion to section: ${section}`)
    updateSection(section, newItems)
    handleRemoveSuggestion(index, suggestionId)
  }

  const handleRemoveSuggestion = (index: number, suggestionId: string) => {
    console.log(`Removing suggestion with id: ${suggestionId} from message index: ${index}`)
    let updatedMessage = {...messages[index],
      suggestions: messages[index]?.suggestions?.filter((s: any) => s.id !== suggestionId)
    }
    console.log(`Updated message: ${JSON.stringify(updatedMessage, null, 2)}`)
    const updatedMessages = [...messages.slice(0, index), updatedMessage, ...messages.slice(index + 1)]
    console.log(`Updated messages: ${JSON.stringify(updatedMessages, null, 2)}`)
    addMessages(updatedMessages)
  }

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
    handleRemoveSuggestion(index, suggestionId)
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

  const handleAction = async (action: string) => {
    const actionMessage = action === 'question' ? `Question me about ${activeSection}` : action === 'critique' ? `Critique the ${activeSection}` : action === 'research' ? `Research the ${activeSection}` : `Suggest things for ${activeSection}`
    setIsLoading(true)
    setActiveSection(null)
    const userMessage = { role: 'user', content: actionMessage, action: action } as Message
    const currentMessages = [...messages.filter((m: Message) => m.role == 'system' || m.role == 'user' || m.role == 'assistant')]

    try {
      addMessages([...currentMessages, userMessage])

      const aiResponse = await sendChatRequest([...currentMessages, userMessage], formData)
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
      addMessages([...currentMessages, userMessage, formattedResponse])
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
        : String(error)
      
      addMessages([...currentMessages, userMessage, { 
        role: 'error', 
        content: `An error occurred:\n\n${errorMessage}` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`h-full flex flex-col ${isExpanded ? '' : 'items-center'}`}>
      {isExpanded ? (
        <>
          <div className="flex items-center justify-between gap-2 p-4 border-b border-zinc-300/50 dark:border-zinc-800/50">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground">AI Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={()=>setIsWide(!isWide)}
            >
              {isWide ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message, messageIndex) => (
                <div key={messageIndex} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                    </div>
                  )}
                  <div className={`max-w-[600px] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-muted text-mut-foreground dark:bg-secondary dark:text-secondary-foreground' 
                      : message.role === 'assistant'
                      ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                      : 'bg-destructive/50 text-destructive-foreground'
                  }`}>
                    {message.role === 'error' ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <ReactMarkdown className="prose dark:prose-invert prose-sm">
                        {message.content}
                      </ReactMarkdown>
                    )}
                    {message.suggestions && (
                      <div className="mt-2">
                        <AnimatePresence initial={false}>
                          {message.suggestions.map((suggestion, index) => (
                            <motion.div
                              key={suggestion.id || index}
                              initial={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                              animate={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <AISuggestionItem   
                                suggestion={suggestion}
                                onLike={() => handleAddSuggestion(messageIndex, suggestion.section, suggestion.suggestion, suggestion.rationale, suggestion.id)}
                                onDismiss={() => handleDismiss(messageIndex, suggestion.id)}
                                onExpand={() => handleExpand(suggestion)}
                              />
                            </motion.div>
                          ))}
                          
                        </AnimatePresence>
                      </div>
                    )}
                    {message.questions && (
                            <motion.div
                              key="questions"
                              initial={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                              animate={{ opacity: 1, height: "auto", marginBottom: "0.5rem" }}
                              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              {message.questions.map((question: any, index: number) => (
                                <AIQuestionItem
                                  key={index}
                                  question={question}
                                  onSubmit={(id, answer) => {
                                    console.log(`Question ${id} answered with: ${answer}`)
                                  }}
                                />
                              ))}
                            </motion.div>
                          )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary dark:bg-secondary flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary-foreground dark:text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <AIThinkingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          <div className="flex-shrink-0">
            <SectionButtons 
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
            />
            <div className={`transition-all duration-200 ease-in-out ${
              activeSection 
                ? 'opacity-100 max-h-20 translate-y-0' 
                : 'opacity-0 max-h-0 -translate-y-2 pointer-events-none'
            }`}>
              <ActionButtons
                onActionSelect={handleAction}
              />
            </div>
            <div className="p-2">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isExpanded ? "Type your message..." : "Chat..."}
                  className="flex-grow bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading}
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
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
              <Bot className="h-5 w-5" />
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