'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasLayoutDetails } from "@/types/canvas-sections"

interface LayoutSelectorProps {
  layouts: CanvasLayoutDetails[]
  selectedLayout: string | null
  onSelect: (layoutKey: string) => void
}

export function LayoutSelector({ layouts, selectedLayout, onSelect }: LayoutSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground text-center">Choose a Layout</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {layouts.map((layout) => (
          <motion.div
            key={layout.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: layout.key === selectedLayout ? 1.05 : 1 }}
            whileHover={{ scale: 1.05 }}
            className="min-h-[160px] p-4 transition-all duration-300"
          >
            <Button
              variant="outline"
              className={`w-full h-full min-h-[160px] p-4 ${
                layout.key === selectedLayout ? 'bg-blue-500 text-white' : 'bg-card text-card-foreground'
              } hover:bg-blue-400`}
              onClick={() => onSelect(layout.key)}
            >
              <div className="w-full h-full grid gap-2"
                style={{
                  gridTemplateColumns: layout.gridTemplate.columns,
                  gridTemplateRows: layout.gridTemplate.rows,
                }}>
                {Array.from({ length: layout.sectionCount }).map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-sm min-h-[30px] min-w-[30px] ${
                      layout.key === selectedLayout ? 'bg-white/80' : 'bg-muted/80'
                    }`}
                    style={{
                      gridArea: layout.areas?.[index] || 'auto',
                      border: '1px solid var(--muted-foreground)',
                    }}
                  />
                ))}
              </div>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
