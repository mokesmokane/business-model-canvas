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

  const handleLike = (suggestionId: string) => {
    console.log(`Like suggestion with id: ${suggestionId}`)
  }

  const handleDismiss = (suggestionId: string) => {
    console.log(`Dismiss suggestion with id: ${suggestionId}`)
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
    <>
      {isExpanded ? (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 p-4 border-b border-gray-800">
            <Bot className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-300">AI Assistant</h3>
          </div>
          <ScrollArea className="flex-grow p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-gray-800 text-gray-100' 
                      : message.role === 'assistant'
                      ? 'bg-gray-800/50 text-gray-100'
                      : 'bg-red-900/50 text-gray-100'
                  }`}>
                    {message.role === 'error' ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <ReactMarkdown className="prose prose-invert prose-sm">
                        {message.content}
                      </ReactMarkdown>
                    )}
                    {message.suggestions && (
                      <div className="mt-2 space-y-2">
                        {message.suggestions.map((suggestion) => (
                          <AISuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            onLike={() => handleLike(suggestion.id)}
                            onDismiss={() => handleDismiss(suggestion.id)}
                            onExpand={() => handleExpand(suggestion)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-300" />
                  </div>
                  <AIThinkingIndicator />
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-2">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isExpanded ? "Type your message..." : "Chat..."}
                className="flex-grow bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading}
                variant="ghost"
                className="text-gray-400 hover:text-gray-100"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-400 hover:text-gray-100"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  )
}