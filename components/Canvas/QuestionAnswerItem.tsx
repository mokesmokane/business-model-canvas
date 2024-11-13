'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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
  Edit2,
  Trash2,
  Star
} from 'lucide-react'
import { AIQuestion } from '@/types/canvas'

interface AIQuestionItemProps {
  question: AIQuestion;
  onEdit?: () => void;
  onDelete?: () => void;
  canvasTheme?: string;
}

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

function AIQuestionItem({ question, onEdit, onDelete, canvasTheme }: AIQuestionItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const renderAnswer = () => {
    switch (question.type) {
      case 'open':
        return (
          <p className={`mt-2 text-sm ${
            canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            {question.answer}
          </p>
        )

      case 'rating':
        return question.scale ? (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              {[...Array(question.scale.max)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < Number(question.answer)
                      ? 'fill-current text-yellow-400'
                      : canvasTheme === 'light'
                        ? 'text-gray-300'
                        : 'text-gray-600'
                  }`}
                />
              ))}
              <span className={`ml-2 text-sm ${
                canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
              </span>
            </div>
          </div>
        ) : null

      case 'multipleChoice':
        return (
          <p className={`mt-2 text-sm ${
            canvasTheme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            {question.answer}
          </p>
        )
    }
  }

  const Icon = question.section ? sectionIcons[question.section] : undefined

  return (
    <Card 
      canvasTheme={canvasTheme}
      className={`mb-2 border-2 ${
        canvasTheme === 'dark' 
          ? 'bg-gray-900 border-gray-800 text-gray-100' 
          : 'bg-white border-gray-200 text-gray-900'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {Icon && (
            <Icon className={`w-4 h-4 mt-1 ${
              canvasTheme === 'light' ? 'text-gray-500' : 'text-gray-400'
            }`} />
          )}
          <div className="flex-1">
            <p className={`text-sm mb-2 ${
              canvasTheme === 'light' ? 'text-gray-700' : 'text-gray-200'
            }`}>
              {question.question}
            </p>
            {renderAnswer()}
            <div 
              className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isHovered ? 'opacity-100 max-h-24 translate-y-0' : 'opacity-0 max-h-0 translate-y-2'
              } overflow-hidden`}
            >
              <div className="flex items-center space-x-2 mt-2 justify-end">
                <Button 
                  onClick={onEdit}
                  size="sm" 
                  variant="outline"
                  canvasTheme={canvasTheme}
                  className={`flex items-center ${
                    canvasTheme === 'light' 
                      ? 'border-gray-200 hover:bg-gray-100'
                      : 'border-gray-700 hover:bg-gray-800'
                  }`}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={onDelete}
                  size="sm" 
                  variant="outline"
                  canvasTheme={canvasTheme}
                  className={`flex items-center ${
                    canvasTheme === 'light' 
                      ? 'border-gray-200 hover:bg-gray-100'
                      : 'border-gray-700 hover:bg-gray-800'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIQuestionItem 