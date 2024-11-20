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
import { useNewCanvas } from "@/contexts/NewCanvasContext"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CanvasTypeSelector() {
  const { selectedType: initialType, setSelectedType } = useNewCanvas();
  const [selectedType, setSelectedTypeLocal] = useState<CanvasType | null>(initialType);
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
    getCanvasTypes().then((types) => {
        setCanvasTypes(types)
        console.log("canvasTypes in useEffect", canvasTypes)
    })
  }, [getCanvasTypes])

  useEffect(() => {
    if (selectedType) {
      const fetchLayouts = async () => {
        const layouts = await getLayoutsForSectionCount(selectedType.sections.length);
        setCompatibleLayouts(layouts);
        if (!selectedLayout) {
        }
      };
      fetchLayouts();
    }
  }, [selectedType, getLayoutsForSectionCount]);

  useEffect(() => {
    setSelectedType(selectedType);
  }, [selectedType, setSelectedType]);

  const handleCanvasTypeSelect = (canvasType: CanvasType) => {
    if (selectedType === canvasType) {
      setSelectedTypeLocal(null);
      setSelectedLayout(null);
      setCompatibleLayouts([]);
    } else {
      setSelectedTypeLocal(canvasType);
    }
  }

  const handleLayoutSelect = (layout: CanvasLayoutDetails) => {
    setSelectedLayout(layout)
}

  useEffect(() => {
    if (selectedType && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedType])

  console.log("canvasTypes in CanvasTypeSelector", canvasTypes)
  return (
    <div className="flex flex-col items-center gap-8 bg-background w-full h-screen overflow-hidden">
      <div className="h-[200px]">
        <AnimatePresence mode="wait">
          {!selectedType ? (
            <motion.div
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center space-y-4 w-full max-w-[600px] p-8 h-full"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Create Your {userCanvases && userCanvases.length > 0 ? 'Next' : 'First'} Canvas
              </h2>
              <p className="text-muted-foreground">
                Choose a canvas type to get started. Each canvas is designed to help you visualize and develop different aspects of your business.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="selected-type"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[600px] p-8 h-full"
            >
              <div className="flex flex-col items-center gap-4">
                <CanvasTypeIcon icon={selectedType.icon} theme={theme} />
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-semibold text-foreground">{selectedType.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedType.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTypeLocal(null);
                    setSelectedLayout(null);
                  }}
                  className="mt-2"
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Choose Different Type
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!selectedType ? (
        <ScrollArea className="w-full flex-1">
          <div className="relative flex flex-wrap gap-6 w-full justify-center p-6">
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
        </ScrollArea>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full flex-1 overflow-auto p-8"
        >
          <LayoutSelector
            layouts={compatibleLayouts}
            selectedLayout={selectedLayout}
            onSelect={handleLayoutSelect}
            canvasType={selectedType}
          />
        </motion.div>
      )}

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