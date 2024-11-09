'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'

interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
}

interface AISuggestionItemProps {
  suggestion: AISuggestion;
  onLike: () => void;
  onDismiss: () => void;
  onExpand: () => void;
}

function AISuggestionItem({ suggestion, onLike, onDismiss, onExpand }: AISuggestionItemProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
  
    useEffect(() => {
      if (isRemoving) {
        const timer = setTimeout(() => {
          if (isLiked) {
            onLike()
          } else {
            onDismiss()
          }
        }, 500) // Match this with the animation duration
        return () => clearTimeout(timer)
      }
    }, [isRemoving, isLiked, onLike, onDismiss])
  
    const handleLike = () => {
      setIsLiked(true)
      setIsRemoving(true)
    }
  
    const handleDismiss = () => {
      setIsLiked(false)
      setIsRemoving(true)
    }
  
    return (
      <Card 
        className={`mb-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isHovered ? 'scale-[1.03] shadow-lg' : 'scale-100 shadow'
        } ${
          isRemoving
            ? isLiked
              ? 'scale-110 opacity-0 translate-y-[-20px]'
              : 'scale-90 opacity-0 translate-y-[20px]'
            : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-3 relative">
          <div className="text-sm mb-2 prose prose-sm dark:prose-invert max-w-none">
            {suggestion.suggestion}
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            {suggestion.rationale}
          </div>
          <div 
            className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isHovered ? 'opacity-100 max-h-24 translate-y-0' : 'opacity-0 max-h-0 translate-y-2'
            } overflow-hidden`}
          >
            <div className="flex items-center space-x-1 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleLike}
                aria-label="Like suggestion"
                className="flex items-center text-xs py-1 px-2"
              >
                <span role="img" aria-label="Bullseye" className="mr-1">🎯</span>
                Spot on!
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                aria-label="Dismiss suggestion"
                className="flex items-center text-xs py-1 px-2"
              >
                <span role="img" aria-label="Face vomiting" className="mr-1">🤮</span>
                Way off!
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onExpand}
                aria-label="Expand suggestion"
                className="flex items-center text-xs py-1 px-2"
              >
                <span role="img" aria-label="Thinking face" className="mr-1">🤔</span>
                Tell me more
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  export default AISuggestionItem