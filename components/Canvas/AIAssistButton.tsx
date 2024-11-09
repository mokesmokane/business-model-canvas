import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'
import { v4 as uuidv4 } from 'uuid';

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

export function AIAssistButton({ section, sectionKey }: { section: string, sectionKey: string }) {
  const { formData, updateField } = useCanvas()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleAIAssist = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: section,
          currentContent: formData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI assistance')
      }

      const data = await response.json()
      if (data.content) {
        const parsedData = JSON.parse(data.content)
        const suggestionsWithIds = parsedData.suggestions.map((s: Omit<AISuggestion, 'id'>) => ({
          id: uuidv4(),
          suggestion: s.suggestion,
          rationale: s.rationale
        }))
        
        updateField(`${sectionKey}_ai_suggestions` as keyof typeof formData, 
          suggestionsWithIds
        )
      }
    } catch (error) {
      console.error('Error getting AI assistance:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAIAssist}
      disabled={isLoading}
      variant="outline"
      size="icon"
      className="ml-2"
    >
      <Sparkles className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
    </Button>
  )
} 