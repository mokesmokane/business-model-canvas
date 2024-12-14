import { Handle, Position } from 'reactflow'
import { Canvas, CanvasHierarchyNode } from '@/types/canvas'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import { useCanvas } from '@/contexts/CanvasContext'
import { useEffect, useState } from 'react'
import { useCanvasService } from '@/contexts/CanvasServiceContext'
import DynamicIcon from '@/components/Util/DynamicIcon'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { ReadOnlySectionItem } from './ReadOnlySectionItem'

interface CanvasNodeProps {
  data: {
    canvas: CanvasHierarchyNode
    isHighlighted: boolean
    isParentHighlighted: boolean
    highlightedSection: string | null
    highlightItem: string | null
    onNodeMouseEnter: (itemId?: string) => void
    onNodeMouseLeave: () => void
  }
}

export function CanvasNode({ data }: CanvasNodeProps) {
    const { canvas, isHighlighted, isParentHighlighted, highlightedSection, highlightItem } = data
  const canvasService = useCanvasService()
  const [canvasData, setCanvasData] = useState<Canvas | null>(null)
  const [selectedItem, setSelectedItem] = useState<{
    item: any,
    sectionName: string
  } | null>(null)

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
    <>
      <div 
        className="px-2 py-1 shadow-lg rounded-lg border min-w-[150px] transition-all duration-200 bg-background"
        onMouseEnter={() => {
          data.onNodeMouseEnter(canvas.parentSectionItem)
        }}
        onMouseLeave={() => {
          console.log('Mouse left node:', canvas.id)
          data.onNodeMouseLeave()
        }}
      >
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
                <div className="mt-0.5">
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
                        className={`flex flex-col p-1 rounded-sm border border-dashed
                          ${section.name === highlightedSection 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-primary/20 bg-primary/5'}`}
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
                            <div 
                              key={itemIndex} 
                              className="flex items-center gap-0.5 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedItem({ item, sectionName: section.name })
                              }}
                            >
                              <span className={`text-[0.5rem] px-1 py-0.5 rounded-sm
                                ${section.name === highlightedSection && item.id === highlightItem
                                  ? 'bg-blue-300 text-blue-800'
                                  : 'bg-gray-300 text-gray-300'}`}
                              >
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

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle className="text-lg font-medium">
            {selectedItem?.sectionName}
          </DialogTitle>
          {selectedItem && (
            <ReadOnlySectionItem
              item={selectedItem.item}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

