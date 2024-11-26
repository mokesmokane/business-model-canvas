'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import DynamicIcon from '../../Util/DynamicIcon'
import { useCanvasTypes } from '@/contexts/CanvasTypeContext'
import { CanvasType } from '@/types/canvas-sections'
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Tooltip } from '@/components/ui/tooltip'

interface CanvasSuggestionItemProps {
  canvasTypeId: string  
  onSelect: (canvasTypeId: string) => void;
}

function CanvasSuggestionItem({ canvasTypeId, onSelect }: CanvasSuggestionItemProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {getCanvasTypes} = useCanvasTypes()
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null)

  useEffect(() => {
    getCanvasTypes().then((types) => {
      setCanvasType(types[canvasTypeId])
    })
  }, [canvasTypeId])

  const handleSubmit = () => {
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={`mb-2 border-2 dark:bg-gray-900 bg-white dark:border-gray-800 border-gray-200 
            ${isSubmitted ? 'scale-95 opacity-50' : ''} transition-all duration-300`}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                {canvasType?.icon && <DynamicIcon name={canvasType.icon} className="w-4 h-4 dark:text-gray-400 text-gray-500" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm dark:text-gray-200 text-gray-700">{canvasType?.name}</p>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={isSubmitted}
                    >
                      select
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-[450px] p-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{canvasType?.name}</CardTitle>
                {canvasType?.icon && (
                  <DynamicIcon name={canvasType.icon} className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <CardDescription>
                {canvasType?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canvasType?.defaultLayout && (
                <div className="mt-2">
                  <div className="w-full h-32">
                    <div
                      className="w-full h-full grid gap-1"
                      style={{
                        gridTemplateColumns: canvasType.defaultLayout.layout.gridTemplate.columns,
                        gridTemplateRows: canvasType.defaultLayout.layout.gridTemplate.rows,
                      }}
                    >
                      {canvasType.sections.map((section, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed
                            border-primary/20 bg-primary/5"
                          style={{
                            gridArea: canvasType.defaultLayout?.layout.areas?.[index] || 'auto',
                          }}
                        >
                          <div className="flex items-center justify-center flex-wrap gap-1">
                            <DynamicIcon 
                              name={section.icon} 
                              className="w-4 h-4 text-primary"
                            />
                            <span className="text-xs text-center text-primary">
                              {section.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CanvasSuggestionItem 