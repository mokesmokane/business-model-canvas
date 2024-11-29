'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import DynamicIcon from "../Util/DynamicIcon"
import { CanvasType } from "@/types/canvas-sections"
import { TAG_INFO } from "@/src/constants/tags"

interface CanvasTypeCardTagsProps {
  type: CanvasType
  isSelected: boolean
  onClick: (type: CanvasType) => void
}

export function CanvasTypeCardTags({ type, isSelected, onClick }: CanvasTypeCardTagsProps) {
  return (
    <motion.div
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
        className={`cursor-pointer hover:shadow-xl transition-all duration-300 relative group h-[280px] ${isSelected ? 'shadow-lg' : ''}`}
        onClick={() => onClick(type)}
      >
        <CardHeader className="group-hover:opacity-0 transition-opacity duration-300">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{type.name}</CardTitle>
            {type.icon && <DynamicIcon name={type.icon} className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />}
          </div>
          <CardDescription className="line-clamp-6">
            {type.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
        {type.tags && type.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center group-hover:opacity-0 transition-opacity duration-300">
            {type.tags.map(tagName => {
              const tagInfo = TAG_INFO.find(t => t.name === tagName);
              return tagInfo && (
                <span
                  key={tagName}
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${tagInfo.color}`}
                >
                  {tagName}
                </span>
              );
            })}
            </div>
          )}

          {/* Hover Grid */}
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
                  className={`flex items-center justify-center gap-2 rounded-md border-2 ${isSelected ? 'border-primary' : 'border-dashed border-primary/20'}
                    border-primary/20 bg-primary/5 transition-all duration-300 ${isSelected ? 'border-primary' : ''}`}
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
  )
} 