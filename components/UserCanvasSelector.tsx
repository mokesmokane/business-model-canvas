'use client'

import { useCanvas } from "@/contexts/CanvasContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Grid2x2 } from 'lucide-react'
import { motion } from "framer-motion"
import { CANVAS_TYPES, CANVAS_LAYOUTS } from "@/types/canvas-sections"
import { useRef, useEffect } from "react"
import { useExpanded } from "@/contexts/ExpandedContext"

export function UserCanvasSelector() {
  const { userCanvases, loadCanvas } = useCanvas()
  const existingConstraintsRef = useRef<HTMLDivElement>(null)
  const newCanvasConstraintsRef = useRef<HTMLDivElement>(null)

  const handleDrag = (info: any, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollLeft -= info.delta.x
    }
  }

  const handleCanvasSelect = async (canvasId: string) => {
    await loadCanvas(canvasId)
    localStorage.setItem('lastCanvasId', canvasId)
  }

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      e.preventDefault()
    }

    existingConstraintsRef.current?.addEventListener('wheel', preventScroll, { passive: false })
    newCanvasConstraintsRef.current?.addEventListener('wheel', preventScroll, { passive: false })

    return () => {
      existingConstraintsRef.current?.removeEventListener('wheel', preventScroll)
      newCanvasConstraintsRef.current?.removeEventListener('wheel', preventScroll)
    }
  }, [])

  return (
    <div className={`p-8 w-full bg-background space-y-12 `}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Your Canvases</h2>
        <div 
          className="overflow-x-auto scrollbar-hide p-1" 
          ref={existingConstraintsRef}
        >
          <motion.div 
            className="flex gap-6 pb-4"
            drag="x"
            dragDirectionLock
            dragMomentum={false}
            dragElastic={0}
            onDrag={(_, info) => handleDrag(info, existingConstraintsRef)}
            dragConstraints={existingConstraintsRef}
          >
            {userCanvases.map((canvas) => (
              <motion.div
                key={canvas.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-[450px] flex-shrink-0"
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => canvas.id && handleCanvasSelect(canvas.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{canvas.name}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Grid2x2 className="h-4 w-4" />
                        <span className="text-sm">
                          {CANVAS_TYPES[canvas.canvasTypeKey || 'businessModel'].name}
                        </span>
                      </div>
                    </div>
                    <CardDescription>
                      <div className="flex items-start gap-4">
                        <p className="line-clamp-6 flex-1">{canvas.description}</p>
                        <div className="flex-shrink-0 w-24 h-24">
                          <div
                            className="w-full h-full grid gap-1"
                            style={{
                              gridTemplateColumns: CANVAS_LAYOUTS[canvas.canvasLayoutKey || 'BUSINESS_MODEL'].gridTemplate.columns,
                              gridTemplateRows: CANVAS_LAYOUTS[canvas.canvasLayoutKey || 'BUSINESS_MODEL'].gridTemplate.rows,
                            }}
                          >
                            {Array.from({ length: CANVAS_LAYOUTS[canvas.canvasLayoutKey || 'BUSINESS_MODEL'].sectionCount }).map((_, index) => (
                              <div
                                key={index}
                                className="rounded-sm bg-muted"
                                style={{
                                  gridArea: CANVAS_LAYOUTS[canvas.canvasLayoutKey || 'BUSINESS_MODEL'].areas?.[index] || 'auto',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Last edited {canvas.updatedAt && formatDistanceToNow(canvas.updatedAt, { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Create New Canvas</h2>
        <div 
          className="overflow-x-auto scrollbar-hide pt-1 pl-1" 
          ref={newCanvasConstraintsRef}
        >
          <motion.div 
            className="flex gap-6 pb-4"
            drag="x"
            dragDirectionLock
            dragMomentum={false}
            dragElastic={0}
            onDrag={(_, info) => handleDrag(info, newCanvasConstraintsRef)}
            dragConstraints={newCanvasConstraintsRef}
          >
            {Object.entries(CANVAS_TYPES).map(([key, type]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="w-[300px] flex-shrink-0"
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow h-[280px] flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{type.name}</CardTitle>
                      <Grid2x2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardDescription className="line-clamp-3">{type.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center">
                    <div className="w-full h-24">
                      <div
                        className="w-full h-full grid gap-1"
                        style={{
                          gridTemplateColumns: type.layout.gridTemplate.columns,
                          gridTemplateRows: type.layout.gridTemplate.rows,
                        }}
                      >
                        {Array.from({ length: type.layout.sectionCount }).map((_, index) => (
                          <div
                            key={index}
                            className="rounded-sm bg-muted"
                            style={{
                              gridArea: type.layout.areas?.[index] || 'auto',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}