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
    <div className={`flex flex-col flex-1 overflow-hidden ${
      canvasTheme === 'light' ? 'bg-white text-black' : 'bg-gray-950 text-white'
    }`}>
      <div className="flex-1 overflow-auto p-4"> {/* Main scrollable container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: layout.gridTemplate.columns,
          gridTemplateRows: `repeat(${Math.ceil(canvasType.sections.length / 3)}, minmax(0, 1fr))`,
          gap: '1rem',
          height: 'fit-content',
          minHeight: '100%',
        }}>
        {canvasType.sections.map((sectionConfig, index) => (
          <div key={sectionConfig.key} style={{ 
            gridArea: layout.areas?.[index] || 'auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
              {section(sectionConfig, 'flex-grow overflow-hidden')}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
} 