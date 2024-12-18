'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createCanvasTypeMessage, CreateCanvasTypeMessage, useChat } from '@/contexts/ChatContext'
interface NewCanvasSuggestionItemProps {
  newCanvasSuggestion: {
    canvasType: string;
    sections: string[];
    purpose: string;
  }
}

function NewCanvasSuggestionItem({ newCanvasSuggestion }: NewCanvasSuggestionItemProps) {
  const { sendMessage } = useChat()
  const handleSubmit = () => {
    sendMessage(createCanvasTypeMessage(newCanvasSuggestion))
  }

  console.log('newCanvasSuggestion', newCanvasSuggestion)
  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {newCanvasSuggestion.canvasType}
        </CardTitle>
        <CardDescription>{newCanvasSuggestion.purpose}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {newCanvasSuggestion.sections.map((section, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>•</span>
                {section}
              </div>
            ))}
          </div>
          <Button 
            onClick={handleSubmit} 
            className="w-full"
          >
            {'Use This Canvas'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default NewCanvasSuggestionItem 