'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useCanvasTheme } from '@/contexts/CanvasThemeContext'

interface DynamicInputProps {
    onSubmit: (value: string) => void
    onCancel?: () => void
    placeholder?: string
    initialValue?: string
    isEditing?: boolean
  }
  
  export function DynamicInput({ 
    placeholder = 'Type something...',
    onSubmit, 
    onCancel, 
    initialValue = '', 
    isEditing = false 
  }: DynamicInputProps) {
    const { canvasTheme } = useCanvasTheme()
    const [inputValue, setInputValue] = useState(initialValue)
    const [isExpanded, setIsExpanded] = useState(!!initialValue)
    const [isFocused, setIsFocused] = useState(false)
    const [showButton, setShowButton] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
  
    // Update input value when initialValue changes
    useEffect(() => {
      setInputValue(initialValue)
      setIsExpanded(!!initialValue)
      if (initialValue && textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [initialValue])
  
    useEffect(() => {
      if (isExpanded && textareaRef.current) {
        textareaRef.current.focus()
      }
    }, [isExpanded])
  
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
  
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSubmit()
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
          <Textarea
            ref={textareaRef}
            canvasTheme={canvasTheme}
            className={`w-full resize-none transition-all duration-300 ease-in-out ${
              isExpanded 
                ? 'h-32 pb-12' 
                : 'h-10 overflow-hidden text-ellipsis whitespace-nowrap'
            }`}
            placeholder={isExpanded ? placeholder : isEditing ? "Edit item..." : placeholder.split('\n')[0]}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setIsExpanded(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsExpanded(true)
              setIsFocused(true)
            }}
            onBlur={() => {
              setIsFocused(false)
              if (!inputValue) {
                setIsExpanded(false)
              }
            }}
          />
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