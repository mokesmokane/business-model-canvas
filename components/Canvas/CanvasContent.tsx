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

  useEffect(() => {
  }, [formData]);
  
  // Helper function to safely get section data
  const getSection = (key: string): Section => {
    if (!formData?.sections) return { name: '', items: [], qAndAs: [] };
    return formData.sections.get(key) || { name: '', items: [], qAndAs: [] };
  };

  function section(sectionConfig:any, className?:string) {

    return <CanvasSection
            key={`${sectionConfig.key}-${formData.sections?.get(sectionConfig.key)?.items?.length}`}
            title={sectionConfig.name}
            sectionKey={sectionConfig.key}
            icon={sectionConfig.icon}
            section={getSection(sectionConfig.key)}
            onChange={(value: string[]) => updateSection(sectionConfig.key, value)}
            placeholder={sectionConfig.placeholder}
            className={className}
          />
  }
  let canvasType = CANVAS_TYPES[formData.canvasTypeKey??'businessModel'];
  let layout = CANVAS_LAYOUTS[formData.canvasLayoutKey??'businessModel'] || CANVAS_LAYOUTS.BUSINESS_MODEL;

  
  return (
    <div className={`flex flex-col flex-1 p-4 space-y-4 overflow-auto ${  // Added overflow-auto here
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: layout.gridTemplate.columns,
        gridTemplateRows: layout.gridTemplate.rows || 'auto auto auto',
        gap: '1rem',
        minHeight: '100%', // Changed back to minHeight to allow growth
        // Remove overflow: hidden to allow scrolling
      }}>
        {canvasType.sections.map((sectionConfig, index) => (
          <div key={sectionConfig.key} style={{ 
            gridArea: layout.areas?.[index] || 'auto',
            minHeight: 0,
            height: 'auto', // Changed to auto to allow natural height
            display: 'flex',
            flexDirection: 'column'
          }}>
            {section(sectionConfig, 'h-full overflow-hidden')}
          </div>
        ))}
      </div>
    </div>
  )
} 