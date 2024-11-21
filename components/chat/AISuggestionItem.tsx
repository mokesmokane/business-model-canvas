'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useRef, useEffect } from 'react'
import { 
  ThumbsUp,
  X
} from 'lucide-react'
import DynamicIcon from '../Util/DynamicIcon'
import { useCanvas } from '@/contexts/CanvasContext'

interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
  section?: string;
  itemId?: string;
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
  const [isDismissed, setIsDismissed] = useState(false)
  const { formData } = useCanvas()
  const actionExecuted = useRef(false)
  const icon = formData?.canvasType?.sections.find(section => section.name === suggestion.section)?.icon

  useEffect(() => {
    if (isRemoving && !actionExecuted.current) {
      actionExecuted.current = true;
      const timer = setTimeout(() => {
        if (isLiked) {
          onLike()
        } else {
          onDismiss()
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isRemoving, isLiked, onLike, onDismiss])

  const handleLike = () => {
    setIsLiked(true)
    setIsRemoving(true)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setIsRemoving(true)
  }

  return (
    <Card 
      className={`mb-2 border-2 dark:bg-gray-900 bg-white ${
        isHovered ? 'border-gray-700 dark:border-gray-700 border-gray-300' : 'dark:border-gray-800 border-gray-200'
      } ${
        isRemoving
          ? isLiked
            ? 'opacity-50'
            : isDismissed
              ? 'opacity-50 line-through'
              : ''
          : ''
      } transition-all duration-500`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3 relative">
        <div className={`flex items-start gap-2 ${
          isLiked ? 'text-green-600 dark:text-green-400' : ''
        }`}>
          {icon && <DynamicIcon name={icon}  className={`w-4 h-4 mt-1 ${
            isLiked 
              ? 'text-green-600 dark:text-green-400' 
              : 'dark:text-gray-400 text-gray-500'
          }`} />}
          <div className="flex-1">
            <p className={`text-sm mb-1 ${
              isLiked 
                ? 'text-green-600 dark:text-green-400' 
                : 'dark:text-gray-200 text-gray-700'
            }`}>
              {suggestion.suggestion}
            </p>
            <p className={`text-xs ${
              isLiked 
                ? 'text-green-500/80 dark:text-green-500/60' 
                : 'dark:text-gray-400 text-gray-500'
            }`}>
              {suggestion.rationale}
            </p>
          </div>
        </div>
        <div className={`flex gap-1 mt-2 justify-end transition-opacity duration-300 ${
          isRemoving ? 'opacity-0' : 'opacity-100'
        }`}>
          <Button
            size="sm"
            variant="ghost"
            className={`${
              isLiked 
                ? 'text-green-600 dark:text-green-400' 
                : 'dark:text-gray-400 text-gray-500 dark:hover:text-gray-100 hover:text-gray-900'
            }`}
            onClick={handleLike}
            disabled={isRemoving}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="dark:text-gray-400 text-gray-500 dark:hover:text-gray-100 hover:text-gray-900"
            onClick={handleDismiss}
            disabled={isRemoving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AISuggestionItem