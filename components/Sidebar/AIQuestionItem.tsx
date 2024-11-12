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
  LucideIcon
} from 'lucide-react'

interface AIQuestion {
  id: string;
  question: string;
  section: string;
  type: 'open' | 'rating' | 'multipleChoice';
  options?: string[];
  scale?: {
    min: number;
    max: number;
    label: string;
  };
}

interface AIQuestionItemProps {
  question: AIQuestion;
  onSubmit: (id: string, answer: string | number) => void;
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

function AIQuestionItem({ question, onSubmit }: AIQuestionItemProps) {
  const [answer, setAnswer] = useState<string | number>('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (answer) {
      setIsSubmitted(true)
      onSubmit(question.id, answer)
    }
  }

  const renderQuestionInput = () => {
    switch (question.type) {
      case 'open':
        return (
          <Input
            type="text"
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="mt-2"
          />
        )

      case 'rating':
        return question.scale ? (
          <div className="mt-4 space-y-2">
            <Slider
              min={question.scale.min}
              max={question.scale.max}
              step={1}
              value={[Number(answer) || question.scale.min]}
              onValueChange={(value) => setAnswer(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{question.scale.min}</span>
              <span>{question.scale.label}</span>
              <span>{question.scale.max}</span>
            </div>
          </div>
        ) : null

      case 'multipleChoice':
        return question.options ? (
          <RadioGroup
            className="mt-2 space-y-2"
            value={answer as string}
            onValueChange={setAnswer}
          >
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        ) : null
    }
  }

  const Icon = question.section ? sectionIcons[question.section] : undefined

  console.log('question', question)
  return (
    <Card className={`mb-2 border-2 dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-200 
      ${isSubmitted ? 'scale-95 opacity-50' : ''} transition-all duration-300`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {Icon && <Icon className="w-4 h-4 mt-1 dark:text-gray-400 text-gray-500" />}
          <div className="flex-1">
            <p className="text-sm dark:text-gray-200 text-gray-700 mb-2">{question.question}</p>
            {renderQuestionInput()}
            <div className="flex justify-end mt-3">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!answer || isSubmitted}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AIQuestionItem 