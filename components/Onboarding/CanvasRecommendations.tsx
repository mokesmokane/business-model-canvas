'use client'

import { Interest, CanvasRecommendation } from './types/onboarding'
import { canvasRecommendations } from './data/recommendations'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { CanvasType } from '@/types/canvas-sections'
import { useCanvasTypes } from '@/contexts/CanvasTypeContext'
import DynamicIcon from '../Util/DynamicIcon'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogTitle } from '@radix-ui/react-dialog'
import { CanvasTypeSelector } from "@/components/CanvasTypeSelector"
import { LayoutProvider } from '@/contexts/LayoutContext'

interface CanvasRecommendationsProps {
  interest: Interest
  onBack: () => void
  onComplete: () => void
}

export function CanvasRecommendations({ interest, onBack, onComplete }: CanvasRecommendationsProps) {
  const {canvasTypes} = useCanvasTypes();
  const recommendations = interest === 'other' 
    ? Object.values(canvasTypes)
    : canvasRecommendations[interest].map((canvasId) => canvasTypes[canvasId]);
    
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null)

  const handleStartCanvas = (canvas: CanvasType) => {
    setSelectedType(canvas)
    setShowTypeSelector(true)
  }

  return (
    <div className="flex flex-col h-[80vh] overflow-hidden">
      {/* Header - flex-none */}
      <div className="flex-none text-center py-8">
        <h2 className="text-2xl font-bold mb-2">
          {interest === 'other' ? 'All Canvas Types' : 'Recommended Canvases'}
        </h2>
        <p className="text-muted-foreground">
          {interest === 'other' 
            ? 'Browse our complete collection of canvas frameworks'
            : 'Here are some canvas frameworks that match your interests'
          }
        </p>
      </div>

      {/* Scrollable Content - flex-1 with min-h-0 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((canvas, index) => (
              <motion.div
                key={canvas.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ 
                  scale: 1.05,
                  zIndex: 50,
                  transition: { duration: 0.3 }
                }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
              >
                <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 relative group h-[280px]">
                  <CardHeader className="group-hover:opacity-0 transition-opacity duration-300">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{canvas.name}</CardTitle>
                      {canvas.icon && <DynamicIcon name={canvas.icon} className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                    <CardDescription className="line-clamp-2">{canvas.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Preview Grid */}
                    <div className="group-hover:opacity-0 transition-opacity duration-300">
                      <div className="mt-2">
                        <div className="w-full h-24">
                          <div
                            className="w-full h-full grid gap-1"
                            style={{
                              gridTemplateColumns: canvas.defaultLayout?.layout.gridTemplate.columns,
                              gridTemplateRows: canvas.defaultLayout?.layout.gridTemplate.rows,
                            }}
                          >
                            {Array.from({ length: canvas.sections.length }).map((_, index) => (
                              <div
                                key={index}
                                className="rounded-sm bg-muted"
                                style={{
                                  gridArea: canvas.defaultLayout?.layout.areas?.[index] || 'auto',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Grid */}
                    <div 
                      className="absolute inset-x-4 top-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:-translate-y-2"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: canvas.defaultLayout?.layout.gridTemplate.columns || 'repeat(2, 1fr)',
                        gridTemplateRows: canvas.defaultLayout?.layout.gridTemplate.rows || 'repeat(2, 1fr)',
                        gap: '0.5rem',
                        height: '180px'
                      }}
                    >
                      {canvas.sections.map((section, index) => {
                        let gridArea;
                        if (canvas.defaultLayout?.layout.areas?.[index]) {
                          const [row, col, rowSpan, colSpan] = canvas.defaultLayout.layout.areas[index].split('/').map(n => n.trim());
                          gridArea = `${row} / ${col} / ${rowSpan} / ${colSpan}`;
                        } else {
                          const row = Math.floor(index / 2) + 1;
                          const col = (index % 2) + 1;
                          gridArea = `${row} / ${col} / ${row + 1} / ${col + 1}`;
                        }
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed
                              border-primary/20 bg-primary/5 transition-all duration-300"
                            style={{ gridArea }}
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
                        );
                      })}
                    </div>

                    {/* Start Button */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        className="w-full" 
                        onClick={() => handleStartCanvas(canvas)}
                      >
                        Start with this canvas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - flex-none */}
      <div className="flex-none border-t bg-background">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Skip for now
          </Button>
        </div>
      </div>

      {/* Dialog remains the same */}
      <Dialog open={showTypeSelector} onOpenChange={setShowTypeSelector}>
        <DialogContent className="!max-w-[80vw] !w-[80vw] sm:!max-w-[80vw] h-[85vh] overflow-hidden rounded-md border">
          <DialogTitle></DialogTitle>
          <LayoutProvider>
            <CanvasTypeSelector selectedType={selectedType} />
          </LayoutProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}

