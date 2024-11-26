import { CanvasSection } from "./CanvasSection"
import { useEffect, useState } from "react"
import { useCanvas } from "@/contexts/CanvasContext"
import { CanvasTypeService } from "@/services/canvasTypeService"

interface CanvasContentProps {
  onExpandSidebar: () => void
}

export function CanvasContent({ onExpandSidebar }: CanvasContentProps) {
  const { formData, canvasTheme, updateSection } = useCanvas();
  if(!formData) {
    return null
  }
  let canvasType = formData.canvasType;


  // Convert sections Map to array and sort by gridIndex
  const sortedSections = Array.from(formData.sections.entries())
    .map(([key, section]) => ({
      key,
      section,
      config: canvasType.sections.find(s => s.name === key)
    }))
    .sort((a, b) => (a.section.gridIndex || 0) - (b.section.gridIndex || 0));
  return (
    <div className={`flex flex-col flex-1 p-4 space-y-4 overflow-auto ${
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: formData.canvasLayout.gridTemplate.columns,
        gridTemplateRows: formData.canvasLayout.gridTemplate.rows || 'auto auto auto',
        gap: '1rem',
        minHeight: '100%',
      }}>
        {sortedSections.map((item, index) => (
          <div 
            key={item.key} 
            style={{ 
              gridArea: formData.canvasLayout.areas?.[index] || 'auto',
              minHeight: 0,
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <CanvasSection
              key={`${item.key}-${item.section.items?.length}`}
              title={item.config?.name || ''}
              sectionKey={item.key}
              icon={item.config!.icon}
              section={item.section}
              onChange={(value: string[]) => updateSection(item.key, value)}
              placeholder={item.config?.placeholder || ''}
              className="h-full overflow-hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
} 