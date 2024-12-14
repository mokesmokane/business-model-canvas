import { Handle, Position } from 'reactflow'
import { Canvas, CanvasHierarchyNode } from '@/types/canvas'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'
import { useEffect, useState } from 'react'
import { useCanvasService } from '@/contexts/CanvasServiceContext'
import DynamicIcon from '@/components/Util/DynamicIcon'

interface CanvasNodeProps {
  data: {
    canvas: CanvasHierarchyNode
  }
}

export function CanvasNode({ data }: CanvasNodeProps) {
  const { canvas } = data
  const canvasService = useCanvasService()
  const [canvasData, setCanvasData] = useState<Canvas | null>(null)

  useEffect(() => {
    async function fetchCanvas() {
      try {
        const loadedCanvas = await canvasService.getCanvas(canvas.id)
        if (loadedCanvas) {
          setCanvasData(loadedCanvas)
        }
      } catch (error) {
        console.error('Error loading canvas:', error)
      }
    }

    fetchCanvas()
  }, [canvas.id, canvasService])

  return (
    <div className="px-2 py-1 shadow-lg rounded-lg bg-background border min-w-[150px]">
      <Handle type="target" position={Position.Top} className="w-1 h-1" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[0.5rem] text-muted-foreground">
          <div className="flex items-center gap-1">
            {canvasData?.canvasType?.icon && (
              <DynamicIcon 
                name={canvasData.canvasType.icon} 
                className="h-2.5 w-2.5 text-muted-foreground"
              />
            )}
            <div>{canvas.type}</div>
          </div>
          <Link href={`/canvas/${canvas.id}`}>
            <Button variant="ghost" size="icon" className="h-4 w-4">
              <ExternalLink className="h-2 w-2" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between -mt-1.5">
          <div className="flex items-center gap-1">
            <div className="font-medium truncate text-[0.6rem]">{canvas.title}</div>
          </div>
        </div>
        <div className="text-[0.5rem] text-muted-foreground space-y-0.5 -mt-1.5">
          {canvasData && (
            <>
              <div>{canvasData.description}</div>
              <div className="mt-1">
                <div 
                  className="w-full h-48"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: canvasData.canvasLayout.gridTemplate.columns,
                    gridTemplateRows: canvasData.canvasLayout.gridTemplate.rows,
                    gap: '0.25rem',
                  }}
                >
                  {Array.from(canvasData.sections.values()).map((section, index) => (
                    <div
                      key={index}
                      className="flex flex-col p-1 rounded-sm border border-dashed
                        border-primary/20 bg-primary/5"
                      style={{
                        gridArea: canvasData.canvasLayout.areas?.[index] || 'auto',
                      }}
                    >
                      <div className="flex items-start gap-0.5">
                        {canvasData.canvasType.sections[index]?.icon && (
                          <DynamicIcon 
                            name={canvasData.canvasType.sections[index].icon} 
                            className="w-2 h-2 text-primary"
                          />
                        )}
                        <span className="text-[0.5rem] text-primary truncate">
                          {section.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {Array.from(section.sectionItems).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-0.5">
                            <span className="bg-gray-300 text-gray-300 text-[0.5rem] px-1 py-0.5 rounded-sm">
                              {itemIndex + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-0.5">
                Last updated: {canvasData.updatedAt && new Date(canvasData.updatedAt).toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-1 h-1" />
    </div>
  )
}

