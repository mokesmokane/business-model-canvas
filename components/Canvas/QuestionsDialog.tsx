import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from '@/components/ui/scroll-area'
import QuestionAnswerItem from './QuestionAnswerItem'
import { useCanvas } from '@/contexts/CanvasContext'

interface QuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questions: any[]
  onDelete: (index: number) => void
  onEdit: (index: number, updatedQuestion: any) => void
  sectionTitle: string
}

export function QuestionsDialog({
  open,
  onOpenChange,
  questions,
  onDelete,
  onEdit,
  sectionTitle
}: QuestionsDialogProps) {
  const { canvasTheme } = useCanvas()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        canvasTheme={canvasTheme}
        className={`max-w-2xl max-h-[80vh] flex flex-col ${
          canvasTheme === 'light' 
            ? 'bg-white text-gray-900 border-gray-200'
            : 'bg-gray-950 text-gray-50 border-gray-800'
        }`}
      >
        <DialogHeader>
          <DialogTitle className={
            canvasTheme === 'light' ? 'text-gray-900' : 'text-gray-50'
          }>
            {sectionTitle} Questions & Answers
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          {questions.map((qa, index) => (
            <QuestionAnswerItem 
              key={index}
              question={qa}
              onEdit={() => onEdit(index, qa)}
              onDelete={() => onDelete(index)}
              canvasTheme={canvasTheme}
            />
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 