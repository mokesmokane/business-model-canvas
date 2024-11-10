'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Workflow, 
  Gift, 
  Heart, 
  Users2, 
  Truck, 
  Receipt, 
  Coins,
  LucideIcon,
  ThumbsUp,
  X
} from 'lucide-react'

// Map section names to their corresponding icons
const sectionIcons: Record<string, LucideIcon> = {
  keyPartners: Building2,
  keyActivities: Workflow,
  keyResources: Receipt,
  valuePropositions: Gift,
  customerRelationships: Heart,
  channels: Truck,
  customerSegments: Users2,
  costStructure: Users,
  revenueStreams: Coins,
}

interface AISuggestion {
  id: string;
  suggestion: string;
  rationale: string;
  section?: string;
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

  const Icon = suggestion.section ? sectionIcons[suggestion.section] : undefined

  useEffect(() => {
    if (isRemoving) {
      const timer = setTimeout(() => {
        if (isLiked) {
          onLike()
        } else {
          onDismiss()
        }
      }, 500)
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
      className={`mb-2 border-2 bg-gray-800/50 ${
        isHovered ? 'border-gray-700' : 'border-gray-800'
      } ${
        isRemoving
          ? isLiked
            ? 'scale-110 opacity-0 translate-y-[-20px]'
            : 'scale-90 opacity-0 translate-y-[20px]'
          : ''
      } transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3 relative">
        <div className="flex items-start gap-2">
          {Icon && <Icon className="w-4 h-4 mt-1 text-gray-400" />}
          <div className="flex-1">
            <p className="text-sm text-gray-200 mb-1">{suggestion.suggestion}</p>
            <p className="text-xs text-gray-400">{suggestion.rationale}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-100"
            onClick={handleLike}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-100"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AISuggestionItem