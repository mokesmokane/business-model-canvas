'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, AlertTriangle } from 'lucide-react'
import AISuggestionItem from '@/components/Canvas/AISuggestionItem'
import { AIThinkingIndicator } from '@/components/ui/ai-thinking'
import { useCanvas } from '@/contexts/CanvasContext'
import ReactMarkdown from 'react-markdown'
import { useChat } from '@/contexts/ChatContext'
import { Message } from '@/contexts/ChatContext'

interface AIChatAreaProps {
  isExpanded: boolean
}

export function AIChatArea({ isExpanded }: AIChatAreaProps) {
  const { updateSection, formData } = useCanvas()
  const { messages, addMessage, addMessages, input, setInput, isLoading, setIsLoading } = useChat()

  const handleAddSuggestion = (section: string, suggestion: string, rationale: string, suggestionId: string) => {
    const currentItems = (formData[section as keyof typeof formData] as string[]) || []
    const newItems = [...currentItems, `${suggestion}\n\n${rationale}`]
    updateSection(section, newItems)
    
    const updatedMessages = messages.map((message: Message) => {
      if (message.role === 'assistant' && message.suggestions) {
        return {
          ...message,
          suggestions: message.suggestions.filter(s => s.id !== suggestionId)
        }
      }
      return message
    })
    addMessages(updatedMessages)
  }

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input } as Message
      addMessages([...messages, userMessage])      
      setInput('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages.filter((m: Message) => m.role !== 'error'), userMessage],
            currentContent: formData
          }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }));
            addMessages([...messages, { 
                role: 'error', 
                content: `Error: ${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}` 
            }]);
        } else {
            const data = await response.json();
            addMessages([...messages, { 
                role: 'assistant', 
                content: data.message,
                suggestions: data.suggestions 
            }]);
        }

      } catch (error) {
        const errorMessage = error instanceof Error 
            ? `${error.name}: ${error.message}\n\nStack: ${error.stack}`
            : String(error);
        
        addMessages([...messages, { 
            role: 'error', 
            content: `An error occurred:\n\n${errorMessage}` 
        }]);
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleExpand = async (suggestion: { suggestion: string }) => {
    const expandMessage = `Tell me more about "${suggestion.suggestion}"`
    setInput('')
    setIsLoading(true)

    try {
      const userMessage = { role: 'user', content: 'Tell me more' } as Message
      addMessages([...messages, userMessage])

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages.filter((m: Message) => m.role !== 'error'), { role: 'user', content: expandMessage }],
          currentContent: formData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'No additional error details available' }))
        addMessages([...messages, { 
          role: 'error', 
          content: `Error: ${response.status} ${response.statusText}\n\nDetails: ${JSON.stringify(errorData, null, 2)}` 
        }])
      } else {
        const data = await response.json()
        addMessages([...messages, { 
          role: 'assistant', 
          content: data.message,
          suggestions: data.suggestions 
        }])
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

  return (
    isExpanded ? (
    <div className="flex flex-col h-full border-t">
      <div className="p-2 font-semibold text-sm flex items-center gap-2 shrink-0">
        <Bot className="h-4 w-4" />
        {isExpanded && 'AI Chat'}
      </div>
      <ScrollArea className="flex-1 px-2">
        {messages.map((message: Message, index: number) => (
          <div key={index} className={`flex flex-col gap-2 mb-2`}>
            <div className={`flex gap-2 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              {message.role === 'assistant' && <Bot className="h-5 w-5 shrink-0" />}
              <div className={`rounded-lg p-2 text-sm ${
                message.role === 'assistant' 
                  ? 'bg-zinc-100 text-zinc-900' 
                  : 'bg-zinc-900 text-zinc-50'
              }`}>
                {message.role === 'assistant' ? (
                  <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
              {message.role === 'user' && <User className="h-5 w-5 shrink-0" />}
              {message.role === 'error' && <AlertTriangle className="h-5 w-5 shrink-0" />}
            </div>
            {message.role === 'assistant' && message.suggestions && (
              <div className="flex flex-col gap-2">
                {message.suggestions.map((suggestion) => (
                  <AISuggestionItem
                    key={`${index}-${suggestion.id}`}
                    suggestion={suggestion}
                    onLike={() => {
                      handleAddSuggestion(
                        suggestion.section,
                        suggestion.suggestion,
                        suggestion.rationale,
                        suggestion.id
                      )
                    }}
                    onDismiss={() => {
                      console.log('Dismissed suggestion:', suggestion.id)
                    }}
                    onExpand={() => handleExpand(suggestion)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <AIThinkingIndicator />
          </div>
        )}
      </ScrollArea>
      <div className="p-2">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isExpanded ? "Type your message..." : "Chat..."}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
      </div>
    ) : null
  )
}