'use client'

import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasLayout, CanvasLayoutDetails, CanvasType } from "@/types/canvas-sections"
import DynamicIcon from "./Util/DynamicIcon"
import { ScrollArea } from "@radix-ui/react-scroll-area"


interface LayoutSelectorProps {
  layouts: CanvasLayoutDetails[]
  selectedLayout: CanvasLayoutDetails | null
  onSelect: (layout: CanvasLayoutDetails) => void
  canvasType: CanvasType | null
}

export function LayoutSelector({ layouts, selectedLayout, onSelect, canvasType }: LayoutSelectorProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="relative flex flex-wrap gap-6 w-full justify-center p-6">
        <AnimatePresence>
          {layouts.map((layout) => (
        <Button
          key={layout.id}
          variant={selectedLayout?.id === layout.id ? "default" : "outline"}
          className={`h-[250px] p-4 relative ${
            selectedLayout?.id === layout.id 
              ? 'ring-2 ring-primary ring-offset-2'
              : 'hover:border-primary/50'
          }`}
          onClick={() => onSelect(layout)}
        >
          <div 
            className={`inset-1 rounded-lg ${
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
              height: '100%',
              minWidth: '400px',
            }}
          >
            {canvasType && layout.layout.areas.map((area, index) => {
              const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
              const sectionData = canvasType.sections[index];
              
              if (!sectionData) return null;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed ${
                    selectedLayout?.id === layout.id
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-muted-foreground/10 bg-muted/5'
                  }`}
                  style={{
                    gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                  }}
                >
                  {sectionData && (
                    <div className="flex items-center justify-center flex-wrap gap-1">
                      <DynamicIcon 
                        name={sectionData.icon} 
                        className={`w-4 h-4 ${
                          selectedLayout?.id === layout.id
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                      <span className={`text-xs text-center ${
                        selectedLayout?.id === layout.id
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}>
                        {sectionData.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

