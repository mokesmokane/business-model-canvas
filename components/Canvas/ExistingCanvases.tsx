'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import DynamicIcon from "../Util/DynamicIcon"
import useEmblaCarousel from 'embla-carousel-react'
import { Canvas } from "@/types/canvas"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ExistingCanvasesProps {
  userCanvases: Canvas[]
  onCanvasSelect: (canvasId: string) => void
}

export function ExistingCanvases({ userCanvases, onCanvasSelect }: ExistingCanvasesProps) {
  const [emblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  })

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-4">Your Canvases</h2>
      <div className="overflow-hidden py-2" ref={emblaRef}>
        <div className="flex gap-6">
          {userCanvases.map((canvas) => (
            <motion.div
              key={canvas.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="w-[400px] flex-shrink-0 p-0.5"
            >
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
                onClick={() => canvas.id && onCanvasSelect(canvas.id)}
              >
                <CardHeader className="space-y-4 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <CardTitle className="text-xl font-semibold">{canvas.name}</CardTitle>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {canvas.canvasType.icon && <DynamicIcon name={canvas.canvasType.icon} className="h-4 w-4" />}
                        <span className="text-xs font-medium">
                          {canvas.canvasType.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-20 h-20 bg-muted/30 rounded-md p-2">
                      <div
                        className="w-full h-full grid gap-0.5"
                        style={{
                          gridTemplateColumns: canvas.canvasLayout.gridTemplate.columns,
                          gridTemplateRows: canvas.canvasLayout.gridTemplate.rows,
                        }}
                      >
                        {Array.from({ length: canvas.canvasLayout.areas.length }).map((_, index) => (
                          <div
                            key={index}
                            className="rounded-[2px] bg-muted"
                            style={{
                              gridArea: canvas.canvasLayout.areas?.[index] || 'auto',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                        <CardDescription className="text-sm leading-relaxed line-clamp-4">
                          {canvas.description}
                        </CardDescription>
                    
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <div className="text-xs text-muted-foreground border-t pt-4">
                    Last edited {canvas.updatedAt && formatDistanceToNow(canvas.updatedAt, { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 