'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasLayout, CanvasLayoutDetails, CanvasType } from "@/types/canvas-sections"
import DynamicIcon from "./Util/DynamicIcon"

interface LayoutSelectorProps {
  layouts: CanvasLayoutDetails[]
  selectedLayout: CanvasLayoutDetails | null
  onSelect: (layout: CanvasLayoutDetails) => void
  canvasType: CanvasType | null
}

export function LayoutSelector({ layouts, selectedLayout, onSelect, canvasType }: LayoutSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {layouts.map((layout) => (
        <Button
          key={layout.id}
          variant={selectedLayout?.id === layout.id ? "default" : "outline"}
          className={`h-[200px] p-4 relative ${
            selectedLayout?.id === layout.id 
              ? 'ring-2 ring-primary ring-offset-2'
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelect(layout)}
        >
          <div 
            className={`absolute inset-1 rounded-lg ${
              selectedLayout?.id === layout.id
                ? 'border-primary/30'
                : 'border-muted-foreground/20'
            }`}
            style={{
              display: 'grid',
              gridTemplateColumns: layout.layout.gridTemplate.columns,
              gridTemplateRows: layout.layout.gridTemplate.rows,
              gap: '0.5rem',
              padding: '0.5rem',
            }}
          >
            {canvasType && layout.layout.areas.map((area, index) => {
              const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
              const sectionData = canvasType.sections[index];
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center gap-2 rounded-md  border-2 border-dashed ${
                    selectedLayout?.id === layout.id
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-muted-foreground/10 bg-muted/5'
                  }`}
                  style={{
                    gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                  }}
                >
                  <DynamicIcon 
                    name={sectionData.icon} 
                    className={`w-4 h-4 ${
                      selectedLayout?.id === layout.id
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span className={`text-xs truncate w-full text-center ${
                    selectedLayout?.id === layout.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}>
                    {sectionData.name}
                  </span>
                </div>
              );
            })}
          </div>
        </Button>
      ))}
    </div>
  )
}
