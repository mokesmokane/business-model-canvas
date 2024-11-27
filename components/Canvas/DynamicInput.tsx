'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'
import { Section } from '@/types/canvas'

interface DynamicInputProps {
    onSubmit: (value: string) => void
    onCancel?: () => void
    section: Section
    placeholder?: string
    initialValue?: string
    isEditing?: boolean
  }
  
  export function DynamicInput({ 
    placeholder = 'Type something...',
    onSubmit, 
    onCancel, 
    initialValue = '', 
    isEditing = false,
    section
  }: DynamicInputProps) {
    const [inputValue, setInputValue] = useState(initialValue)
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0)
    const [showTabPrompt, setShowTabPrompt] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isExpanded, setIsExpanded] = useState(!!initialValue)
    const [isFocused, setIsFocused] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { canvasTheme, formData } = useCanvas()
    const promptTimeoutRef = useRef<NodeJS.Timeout>()
    const currentSuggestion = suggestions[currentSuggestionIndex] || ''
    
    // Update input value when initialValue changes
    useEffect(() => {
      setInputValue(initialValue)
      setIsExpanded(!!initialValue)
      if (initialValue && textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [initialValue])

    // Show/hide button with animation
    useEffect(() => {
      let timer: NodeJS.Timeout
      if (isExpanded) {
        timer = setTimeout(() => setShowButton(true), 300)
      } else {
        setShowButton(false)
      }
      return () => clearTimeout(timer)
    }, [isExpanded])
    
    const handleSubmit = () => {
      if (inputValue.trim()) {
        onSubmit(inputValue.trim())
        setInputValue('')
        setIsExpanded(false)
      }
    }
  
    const handleCancel = () => {
      setInputValue('')
      setIsExpanded(false)
      onCancel?.()
    }
    const getSuggestions = async (text: string) => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, canvas: formData, section: section })
        })
  
        if (!response.ok) throw new Error('Failed to get suggestions')
        
        const data = await response.json()
        setSuggestions(data.completions)
      } catch (error) {
        console.error('Error getting suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      setIsExpanded(true)
      setSuggestions([])
      setCurrentSuggestionIndex(0)
      setShowButton(true)
  
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current)
      }
  
      if (e.target.selectionStart === newValue.length && newValue.trim().length > 0) {
        promptTimeoutRef.current = setTimeout(() => {
          setShowTabPrompt(true)
        }, 500)
      } else {
        setShowTabPrompt(false)
      }
    }
  
    const handleKeyDown = async (e: React.KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        if (showTabPrompt && !isLoading && suggestions.length === 0) {
          setShowTabPrompt(false)
          await getSuggestions(inputValue)
        } else if (suggestions.length > 0) {
          setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length)
        }
      } else if (e.key === 'Enter') {
        if (suggestions.length > 0) {
          e.preventDefault()
          setInputValue(prev => prev + currentSuggestion)
          setSuggestions([])
          setCurrentSuggestionIndex(0)
        } else if (e.shiftKey) {
          return
        } else {
          e.preventDefault()
          handleSubmit()
        }
      } else if (e.key === 'Escape' && onCancel) {
        e.preventDefault()
        handleCancel()
      }
    }
  
    return (
      <div 
        className="w-full"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!inputValue && !isFocused) {
            setIsExpanded(false)
          }
        }}
      >
        <div className={`relative transition-all duration-300 ease-in-out`}>
          <div className="relative">
            <div className="absolute inset-0 pointer-events-none">
              <div className="p-[9px] whitespace-pre-wrap break-words text-base md:text-sm">
                <span className="opacity-0">{inputValue}</span>
                <span className="text-muted-foreground">{currentSuggestion}</span>
              </div>
            </div>
            <Textarea
              ref={textareaRef}
              canvasTheme={canvasTheme}
              className={`w-full resize-none transition-all duration-300 ease-in-out bg-transparent ${
                isExpanded 
                  ? 'h-32 pb-12' 
                  : 'h-10 overflow-hidden text-ellipsis whitespace-nowrap'
              }`}
              placeholder={isExpanded ? placeholder : isEditing ? "Edit item..." : placeholder.split('\n')[0]}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsExpanded(true)
                setIsFocused(true)
                setShowButton(true)
              }}
              onBlur={() => {
                setIsFocused(false)
                if (!inputValue) {
                  setIsExpanded(false)
                  setShowButton(false)
                }
              }}
            />
          </div>
          <div className="absolute left-2 bottom-2 flex items-center gap-2">
            {showTabPrompt && suggestions.length === 0 && !isLoading && (
              <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <kbd className="bg-background px-1 rounded">Tab</kbd>
                <span>suggest</span>
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <kbd className="bg-background px-1 rounded">Tab</kbd>
                <span>{currentSuggestionIndex + 1}/{suggestions.length}</span>
                <kbd className="bg-background px-1 rounded">↵</kbd>
                <span>accept</span>
              </div>
            )}
            {isLoading && (
              <div className="text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/>
              </div>
            )}
          </div>
          {isExpanded && (
            <div 
              className={`absolute right-2 bottom-2 flex items-center gap-2 transition-opacity duration-300 ease-in-out ${
                showButton ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {onCancel && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  aria-label="Cancel"
                  className="py-1 h-7"
                >
                  Cancel
                </Button>
              )}
              <Button 
                size="sm"
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                aria-label={isEditing ? "Save changes" : "Add item"}
                className="py-1 h-7"
              >
                <Send className="h-4 w-4 mr-2" />
                {isEditing ? 'Save' : 'Send'}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }