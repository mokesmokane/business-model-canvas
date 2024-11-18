'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasLayoutDetails } from "@/types/canvas-sections"

interface LayoutSelectorProps {
  layouts: CanvasLayoutDetails[]
  onSelect: (layoutKey: string) => void
}

export function LayoutSelector({ layouts, onSelect }: LayoutSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground text-center">Choose a Layout</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {layouts.map((layout) => (
          <motion.div
            key={layout.key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="min-h-[120px]"
          >
            <Button
              variant="outline"
              className="w-full h-full min-h-[120px] p-4 hover:border-primary bg-card text-card-foreground hover:bg-accent/50"
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
                    className="bg-muted/80 rounded-sm min-h-[30px] min-w-[30px]"
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
