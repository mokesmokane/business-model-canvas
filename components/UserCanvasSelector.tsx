'use client'

import { useCanvas } from "@/contexts/CanvasContext"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { Grid2x2 } from 'lucide-react'
import { motion } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useExpanded } from "@/contexts/ExpandedContext"
import { useLayouts } from "@/contexts/LayoutContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"
import { CanvasLayoutDetails, CanvasType } from "@/types/canvas-sections"
import { useNewCanvas } from "@/contexts/NewCanvasContext"
import DynamicIcon from "./Util/DynamicIcon"
import { TAG_INFO } from "@/src/constants/tags"
import useEmblaCarousel from 'embla-carousel-react'

export function UserCanvasSelector() {
  const { userCanvases, loadCanvas } = useCanvas()
  const existingConstraintsRef = useRef<HTMLDivElement>(null)
  const newCanvasConstraintsRef = useRef<HTMLDivElement>(null)
  const { getLayoutsForSectionCount, getLayouts } = useLayouts()
  const { getCanvasTypes } = useCanvasTypes()
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({})
  const [canvasLayouts, setCanvasLayouts] = useState<Record<string, CanvasLayoutDetails>>({})
  const { setNewCanvas, setSelectedType } = useNewCanvas();
  const [searchTerm, setSearchTerm] = useState('')
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
  const [existingCanvasesRef, existingCanvasesApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  })
  const [newCanvasRef, newCanvasApi] = useEmblaCarousel({
    dragFree: true,
    containScroll: "trimSnaps"
  })

  const tagCarousels = TAG_INFO.reduce((acc, tag) => {
    const [ref, api] = useEmblaCarousel({
      dragFree: true,
      containScroll: "trimSnaps"
    });
    acc[tag.name] = { ref, api };
    return acc;
  }, {} as Record<string, { ref: ReturnType<typeof useEmblaCarousel>[0], api: ReturnType<typeof useEmblaCarousel>[1] }>);

  useEffect(() => {
    getCanvasTypes().then(setCanvasTypes)
  }, [getCanvasTypes])

  useEffect(() => {
    getLayouts().then(setCanvasLayouts)
  }, [getLayouts])

  const handleCanvasSelect = async (canvasId: string) => {
    await loadCanvas(canvasId)
    localStorage.setItem('lastCanvasId', canvasId)
  }

  const handleNewCanvasSelect = (type: CanvasType) => {
    setSelectedType(type);
    setNewCanvas([true, 'root']);
  };

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

  const filteredCanvasTypes = Object.entries(canvasTypes).filter(([_, type]) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCanvasTypesByTag = (tagName: string) => {
    return Object.entries(canvasTypes).filter(([_, type]) => type.tags?.includes(tagName));
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-y-auto bg-background">
      <div className="p-8 space-y-12">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Your Canvases</h2>
          <div className="overflow-hidden" ref={existingCanvasesRef}>
            <div className="flex gap-6 pb-4">
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
                          {canvas.canvasType.icon && <DynamicIcon name={canvas.canvasType.icon} className="h-6 w-6" />}
                          <span className="text-sm">
                            {canvas.canvasType.name}
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
                                gridTemplateColumns: canvas.canvasLayout.gridTemplate.columns,
                                gridTemplateRows: canvas.canvasLayout.gridTemplate.rows,
                              }}
                            >
                              {Array.from({ length: canvas.canvasLayout.sectionCount }).map((_, index) => (
                                <div
                                  key={index}
                                  className="rounded-sm bg-muted"
                                  style={{
                                    gridArea: canvas.canvasLayout.areas?.[index] || 'auto',
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
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <h2 className="text-3xl font-bold tracking-tight mr-4">Create New Canvas</h2>
            <input
              type="text"
              placeholder="Search canvas types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-md p-2 max-w-xs"
            />
          </div>
          <div className="overflow-hidden" ref={newCanvasRef}>
            <div className="flex gap-6 pl-6">
              {filteredCanvasTypes.map(([key, type]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ 
                    scale: 1.15,
                    zIndex: 50,
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-[300px] flex-shrink-0 py-6"
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 relative group h-[280px]"
                    onClick={() => handleNewCanvasSelect(type)}
                  >
                    <CardHeader className="group-hover:opacity-0 transition-opacity duration-300">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{type.name}</CardTitle>
                        {type.icon && <DynamicIcon name={type.icon} className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {type.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="group-hover:opacity-0 transition-opacity duration-300">
                        <div className="mt-2">
                          <div className="w-full h-24">
                            <div
                              className="w-full h-full grid gap-1"
                              style={{
                                gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns,
                                gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows,
                              }}
                            >
                              {Array.from({ length: type.sections.length }).map((_, index) => (
                                <div
                                  key={index}
                                  className="rounded-sm bg-muted"
                                  style={{
                                    gridArea: type.defaultLayout?.layout.areas?.[index] || 'auto',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div 
                        className="absolute inset-x-4 top-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:-translate-y-2"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns || 'repeat(2, 1fr)',
                          gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows || 'repeat(2, 1fr)',
                          gap: '0.5rem',
                          height: '240px'
                        }}
                      >
                        {type.sections.map((section, index) => {
                          let gridArea;
                          if (type.defaultLayout?.layout.areas?.[index]) {
                            const [row, col, rowSpan, colSpan] = type.defaultLayout.layout.areas[index].split('/').map(n => n.trim());
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {TAG_INFO.map(tag => {
          const canvasTypesForTag = getCanvasTypesByTag(tag.name);
          if (canvasTypesForTag.length === 0) return null;

          return (
            <div key={tag.name}>
              <h2 className="text-3xl font-bold tracking-tight mb-4">{`${tag.name} Canvases`}</h2>
              <div className="overflow-hidden" ref={tagCarousels[tag.name].ref}>
                <div className="flex gap-6 pl-6">
                  {canvasTypesForTag.map(([key, type]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ 
                        scale: 1.15,
                        zIndex: 50,
                        transition: { duration: 0.3 }
                      }}
                      transition={{ duration: 0.2 }}
                      className="w-[300px] flex-shrink-0 py-6"
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 relative group h-[280px]"
                        onClick={() => handleNewCanvasSelect(type)}
                      >
                        <CardHeader className="group-hover:opacity-0 transition-opacity duration-300">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">{type.name}</CardTitle>
                            {type.icon && <DynamicIcon name={type.icon} className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
                          </div>
                          <CardDescription className="line-clamp-2">
                            {type.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="group-hover:opacity-0 transition-opacity duration-300">
                            <div className="mt-2">
                              <div className="w-full h-24">
                                <div
                                  className="w-full h-full grid gap-1"
                                  style={{
                                    gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns,
                                    gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows,
                                  }}
                                >
                                  {Array.from({ length: type.sections.length }).map((_, index) => (
                                    <div
                                      key={index}
                                      className="rounded-sm bg-muted"
                                      style={{
                                        gridArea: type.defaultLayout?.layout.areas?.[index] || 'auto',
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div 
                            className="absolute inset-x-4 top-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:-translate-y-2"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: type.defaultLayout?.layout.gridTemplate.columns || 'repeat(2, 1fr)',
                              gridTemplateRows: type.defaultLayout?.layout.gridTemplate.rows || 'repeat(2, 1fr)',
                              gap: '0.5rem',
                              height: '240px'
                            }}
                          >
                            {type.sections.map((section, index) => {
                              let gridArea;
                              if (type.defaultLayout?.layout.areas?.[index]) {
                                const [row, col, rowSpan, colSpan] = type.defaultLayout.layout.areas[index].split('/').map(n => n.trim());
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}