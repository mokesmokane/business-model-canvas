'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasType, CanvasLayout, CanvasLayoutDetails } from "@/types/canvas-sections"
import { useCanvas } from "@/contexts/CanvasContext"
import { NewCanvasDialog } from "./NewCanvasDialog"
import { LayoutSelector } from "./LayoutSelector"
import { TypeIcon as type, LucideIcon, XIcon, AlertCircle } from 'lucide-react'
import { useTheme } from "next-themes"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DynamicIcon from "./Util/DynamicIcon"
import { useLayouts } from "@/contexts/LayoutContext"
import { useCanvasTypes } from "@/contexts/CanvasTypeContext"

export function CanvasTypeSelector() {
  const [selectedType, setSelectedType] = useState<CanvasType | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<CanvasLayoutDetails | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { theme } = useTheme()
  const { userCanvases } = useCanvas()
  const containerRef = useRef<HTMLDivElement>(null)
  const { getLayoutsForSectionCount } = useLayouts()
  const { getCanvasTypes } = useCanvasTypes()
  const [compatibleLayouts, setCompatibleLayouts] = useState<CanvasLayoutDetails[]>([])
  const [canvasTypes, setCanvasTypes] = useState<Record<string, CanvasType>>({})
  
  useEffect(() => {
    getCanvasTypes().then(setCanvasTypes)
  }, [getCanvasTypes])

  const handleCanvasTypeSelect = (canvasType: CanvasType) => {
    if (selectedType === canvasType) {
      setSelectedType(null)
      setSelectedLayout(null)
    } else {
      setSelectedType(canvasType)
      setSelectedLayout(canvasType.defaultLayout)
    }
  }

  const handleLayoutSelect = (layout: CanvasLayoutDetails) => {
    setSelectedLayout(layout)
}

  useEffect(() => {
    if (selectedType) {
      const fetchLayouts = async () => {
        const layouts = await getLayoutsForSectionCount(selectedType.defaultLayout.sectionCount)
        setCompatibleLayouts(layouts)
      }
      fetchLayouts()
    }
  }, [selectedType, getLayoutsForSectionCount])

  useEffect(() => {
    if (selectedType && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedType])

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-background w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 w-full max-w-[600px]"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Create Your {userCanvases && userCanvases.length > 0 ? 'Next' : 'First'} Canvas</h2>
        <p className="text-muted-foreground">
          Choose a canvas type to get started. Each canvas is designed to help you visualize and develop different aspects of your business.
        </p>
      </motion.div>

      <div ref={containerRef} className="relative flex flex-wrap gap-6 w-full justify-center min-h-[400px]">
        <AnimatePresence>
          {Object.entries(canvasTypes).map(([key, type]) => (
            <motion.div
              key={key}
              layout
              initial={{ opacity: 1, scale: 1 }}
              animate={{
                opacity: selectedType ? (selectedType === type ? 1 : 0.5) : 1,
                scale: selectedType === type ? 1.05 : 1,
                zIndex: selectedType === type ? 10 : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                width: 300,
                height: 'auto',
              }}
            >
              <div
                className={`h-full p-8 flex flex-col items-center gap-4 w-full bg-background hover:bg-muted cursor-pointer border rounded-md relative ${
                  selectedType === type ? 'shadow-lg' : ''
                }`}
                onClick={() => handleCanvasTypeSelect(type)}
              >
                <CanvasTypeIcon icon={type.icon} theme={theme} />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-foreground">{type.name}</h3>
                  <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-normal">
                    {type.description}
                  </p>
                </div>
                {selectedType === type && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedType(null)
                      setSelectedLayout(null)
                    }}
                  >
                    <XIcon className="w-4 h-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      
      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 overflow-hidden"
          >
            <LayoutSelector
              layouts={compatibleLayouts}
              selectedLayout={selectedLayout}
              onSelect={handleLayoutSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
    {selectedType && selectedLayout && (
      <NewCanvasDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        canvasType={selectedType || "businessModel"}
        layout={selectedLayout.layout}
        />
      )}
    </div>
  )
}

function CanvasTypeIcon({ icon, theme }: { icon: string; theme?: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <DynamicIcon name={icon} className="w-6 h-6 text-foreground" />
    </div>
  )
}