import React from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'

export function AIAssistButton() {
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
          currentContent: formData
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI assistance')
      }

      const data = await response.json()
      
      // Update all the sections with AI generated content
      Object.entries(data.suggestions).forEach(([key, value]) => {
        updateField(key as keyof typeof formData, value as string)
      })
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