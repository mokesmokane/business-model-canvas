import { CanvasSection } from "./CanvasSection"
import { CANVAS_LAYOUTS, CanvasType } from "@/types/canvas-sections"
import { useEffect } from "react"
import { useCanvas } from "@/contexts/CanvasContext"
import { Section } from "@/types/canvas"
import { CANVAS_TYPES } from "@/types/canvas-sections"

interface CanvasContentProps {
  onExpandSidebar: () => void
}

export function CanvasContent({ onExpandSidebar }: CanvasContentProps) {
  const { formData, canvasTheme, updateSection } = useCanvas();
  let canvasType = CANVAS_TYPES[formData.canvasTypeKey ?? 'businessModel'];
  let layout = CANVAS_LAYOUTS[formData.canvasLayoutKey ?? 'businessModel'] || CANVAS_LAYOUTS.BUSINESS_MODEL;

  // Convert sections Map to array and sort by gridIndex
  const sortedSections = Array.from(formData.sections.entries())
    .map(([key, section]) => ({
      key,
      section,
      config: canvasType.sections.find(s => s.key === key)
    }))
    .sort((a, b) => (a.section.gridIndex || 0) - (b.section.gridIndex || 0));

  return (
    <div className={`flex flex-col flex-1 p-4 space-y-4 overflow-auto ${
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: layout.gridTemplate.columns,
        gridTemplateRows: layout.gridTemplate.rows || 'auto auto auto',
        gap: '1rem',
        minHeight: '100%',
      }}>
        {sortedSections.map((item, index) => (
          <div 
            key={item.key} 
            style={{ 
              gridArea: layout.areas?.[index] || 'auto',
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