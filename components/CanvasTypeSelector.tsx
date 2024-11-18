'use client'

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CANVAS_TYPES, CANVAS_LAYOUTS } from "@/types/canvas-sections"
import { useCanvas } from "@/contexts/CanvasContext"
import { NewCanvasDialog } from "./NewCanvasDialog"
import { LayoutSelector } from "./LayoutSelector"
import { LucideIcon } from 'lucide-react'
import { useTheme } from "next-themes"
import { XIcon } from 'lucide-react'

export function CanvasTypeSelector() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { theme } = useTheme()
  const { userCanvases } = useCanvas();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCanvasTypeSelect = (typeKey: string) => {
    if(selectedType === typeKey) {
        setSelectedType(null)
    } else {
      setSelectedType(typeKey)
      setSelectedLayout(CANVAS_TYPES[typeKey].layout.key)
    }
    // setShowDialog(true)
  }

  const handleLayoutSelect = (layout: string) => {
    setSelectedLayout(layout)
  }

  const handleMouseEnter = (key: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredType(key);
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredType(null);
    }, 200); // Adjust the delay as needed
  }

  const compatibleLayouts = (hoveredType || selectedType)
    ? Object.values(CANVAS_LAYOUTS).filter(
        (layout) => {
          const typeKey = hoveredType || selectedType;
          return typeKey && layout.sectionCount === CANVAS_TYPES[typeKey].layout.sectionCount;
        }
      )
    : []

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 bg-background w-full">
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

      <div className="flex flex-wrap gap-6 w-full justify-center">
        <AnimatePresence>
          {Object.entries(CANVAS_TYPES).map(([key, type]) => (
            <motion.div
              key={key}
              initial={{ opacity: 1 }}
              animate={{
                opacity: selectedType && selectedType !== key ? 0 : 1,
                position: selectedType && selectedType !== key ? 'absolute' : 'relative',
              }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
              transition={{ duration: 0.2 }}
              className={`${
                selectedType && selectedType !== key ? 'hidden' : ''
              }`}
              style={{ minWidth: '300px', maxWidth: '300px', height: 'auto' }}
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={handleMouseLeave}
            >
              <Button
                variant="outline"
                className="h-full p-8 flex flex-col items-center gap-4 w-full bg-background hover:bg-muted"
                onClick={() => handleCanvasTypeSelect(key)}
              >
                <CanvasTypeIcon icon={type.icon} theme={theme} />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-foreground">{type.name}</h3>
                  <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-normal">
                    {type.description}
                  </p>
                </div>
                {selectedType === key && (
                  <Button
                    variant="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setSelectedType(null)}
                  >
                    <XIcon className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {(hoveredType || selectedType) && (
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
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => setShowDialog(true)}
        >
          Create
        </Button>
      )}

      {showDialog && (
        <NewCanvasDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          canvasType={selectedType || "businessModel"}
          layout={selectedLayout || CANVAS_LAYOUTS.BUSINESS_MODEL_LAYOUT_1.key}
        />
      )}
    </div>
  )
}

function CanvasTypeIcon({ icon: Icon, theme }: { icon: LucideIcon; theme?: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Icon className="w-6 h-6 text-foreground" />
    </div>
  )
}   