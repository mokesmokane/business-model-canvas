'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CanvasType } from "@/types/canvas-sections"
import { XIcon } from 'lucide-react'
import DynamicIcon from "../Util/DynamicIcon"
import { TAG_INFO } from "@/src/constants/tags"

interface CanvasTypeCardProps {
  type: CanvasType;
  isSelected: boolean;
  onClick: (type: CanvasType) => void;
  onClose?: (e: React.MouseEvent) => void;
  theme?: string;
  description?: string;
}

export function CanvasTypeCard({ 
  type, 
  isSelected, 
  onClick, 
  onClose,
  theme,
  description
}: CanvasTypeCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: isSelected ? 1 : 1,
        scale: isSelected ? 1.05 : 1,
        zIndex: isSelected ? 10 : 1,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        width: 510,
        height: 'auto',
      }}
    >
      <div
        className={`h-full p-8 flex flex-col items-center gap-4 w-full bg-background hover:bg-muted cursor-pointer border rounded-md relative ${
          isSelected ? 'shadow-lg' : ''
        }`}
        onClick={() => onClick(type)}
      >
        <CanvasTypeIcon icon={type?.icon || 'layout'} theme={theme} />
        <div className="space-y-2 text-center">
          <h3 className="font-semibold text-foreground">{type.name}</h3>
          <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis line-clamp-4">
            {description || type.description}
          </p>
        </div>
        
        

        {type.defaultLayout && (
          <div 
            className="grid gap-1 p-2 border rounded-md w-full mt-2"
            style={{
              gridTemplateColumns: type.defaultLayout.layout.gridTemplate.columns,
              gridTemplateRows: type.defaultLayout.layout.gridTemplate.rows,
              minHeight: '200px'
            }}
          >
            {type.defaultLayout.layout.areas.map((area, index) => {
              const [row, col, rowSpan, colSpan] = area.split('/').map(n => n.trim());
              const sectionData = type.sections[index];

              return (
                <div
                  key={index}
                  className="flex items-center justify-center border-2 border-dashed h-full"
                  style={{
                    gridArea: `${row} / ${col} / ${rowSpan} / ${colSpan}`,
                  }}
                >
                  {sectionData && (
                    <div className="flex items-center justify-center flex-wrap gap-1">
                      <DynamicIcon name={sectionData.icon} className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-center text-muted-foreground">{sectionData.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isSelected && onClose && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              onClose(e);
            }}
          >
            <XIcon className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </motion.div>
  )
}

function CanvasTypeIcon({ icon, theme }: { icon: string; theme?: string }) {
  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <DynamicIcon name={icon} className="w-6 h-6 text-foreground" />
    </div>
  )
} 