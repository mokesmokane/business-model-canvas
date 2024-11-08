import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'

interface Suggestion {
    id: string
    content: string
  }
  
interface AISuggestionItemProps {
    suggestion: Suggestion
    onLike: () => void
    onDismiss: () => void
    onExpand: () => void
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

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let accumulatedContent = ''

      // Read the stream chunk by chunk
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and update immediately
        const chunk = decoder.decode(value, { stream: true })
        accumulatedContent += chunk
        
        // Update the UI immediately with each new chunk
        updateField(`${sectionKey}_ai_suggestion_markdown` as keyof typeof formData, accumulatedContent)
      }

      // Final decode to handle any remaining bytes
      const finalChunk = decoder.decode()
      if (finalChunk) {
        accumulatedContent += finalChunk
        updateField(`${sectionKey}_ai_suggestion_markdown` as keyof typeof formData, accumulatedContent)
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