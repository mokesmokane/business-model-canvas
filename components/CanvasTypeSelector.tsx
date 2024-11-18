'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CANVAS_TYPES, CANVAS_LAYOUTS } from "@/types/canvas-sections"
import { useCanvas } from "@/contexts/CanvasContext"
import { NewCanvasDialog } from "./NewCanvasDialog"
import { LayoutSelector } from "./LayoutSelector"
import { LucideIcon } from 'lucide-react'
import { useTheme } from "next-themes"

export function CanvasTypeSelector() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const { theme } = useTheme()
  const { userCanvases } = useCanvas();

  const handleCanvasTypeSelect = (typeKey: string) => {
    setSelectedType(typeKey)
    setSelectedLayout(CANVAS_TYPES[typeKey].layout.key)
    setShowDialog(true)
  }

  const handleLayoutSelect = (layout: string) => {
    setSelectedLayout(layout)
    setShowDialog(true)
  }

  const compatibleLayouts = selectedType
    ? Object.values(CANVAS_LAYOUTS).filter(
        (layout) => layout.sectionCount === CANVAS_TYPES[selectedType].layout.sectionCount
      )
    : []

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AnimatePresence>
          {Object.entries(CANVAS_TYPES).map(([key, type]) => (
            <motion.div
              key={key}
              initial={{ opacity: 1 }}
              animate={{ opacity: selectedType && selectedType !== key ? 0 : 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="outline"
                className="h-auto p-6 flex flex-col items-center gap-4 w-full bg-background hover:bg-muted"
                onClick={() => handleCanvasTypeSelect(key)}
              >
                <CanvasTypeIcon icon={type.icon} theme={theme} />
                <div className="space-y-2 text-center">
                  <h3 className="font-semibold text-foreground">{type.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8"
          >
            <LayoutSelector
              layouts={compatibleLayouts}
            //   selectedLayout={selectedLayout}
              onSelect={handleLayoutSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

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