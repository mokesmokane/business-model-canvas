import React, { ChangeEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanyEditDialog } from './CompanyEditDialog'
import { Canvas, TextSectionItem, Section } from '@/types/canvas'
import { useCanvas } from '@/contexts/CanvasContext'
import { Grid2x2, Moon, Sun, Printer, ExternalLink, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react'
import LayoutEditor from './LayoutEditor'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react'
import DynamicIcon from '../Util/DynamicIcon'
import { useCanvasContext } from '@/contexts/ContextEnabledContext'

interface HeaderProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Header() {
  const { canvasTheme, formData, updateField, setCanvasTheme } = useCanvas();
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const { setHoveredItemId } = useCanvas();
  const router = useRouter();
  if (!formData) return null;

  useEffect(() => {
  }, [formData]);

  function onInputChange(event: ChangeEvent<HTMLInputElement>): void {
    updateField(event.target.id as keyof Canvas, event.target.value)
  }

  function getChildCanvases(formData: Canvas) {
    return Array.from(formData.sections.values())
      .flatMap(section => 
        section.sectionItems?.filter(item => item.canvasLink) || []
      );
  }

  function findSectionForItem(itemId: string): [string, Section] | undefined {
    return Array.from(formData!.sections.entries())
      .find(([_, section]) => 
        section.sectionItems.some(item => item.id === itemId)
      );
  }

  const handleParentCanvasClick = () => {
    if (formData?.parentCanvasId) {
      localStorage.setItem('lastCanvasId', formData.parentCanvasId)
      router.push(`/canvas/${formData.parentCanvasId}`)
    }
  }

  const handleLinkedCanvasClick = (canvasId: string) => {
    localStorage.setItem('lastCanvasId', canvasId)
    router.push(`/canvas/${canvasId}`)
  }

  return (
    <div className={`flex items-center justify-between p-4 border-b ${
      canvasTheme === 'light' 
        ? 'bg-white border-gray-200 text-black'
        : 'bg-gray-950 border-gray-800 text-white'
    }`}>
      <div className="flex items-center gap-4">
        <h1 className={`text-3xl font-bold tracking-tight ${
          canvasTheme === 'light' ? 'text-black' : 'text-white'
        }`}>
          {formData?.canvasType?.name || ''}
        </h1>
        <div className="flex items-center gap-2">
          <Input 
            canvasTheme={canvasTheme}
            value={formData?.name || ''}
            className={`max-w-[200px] ${
              canvasTheme === 'light' ? 'text-black' : 'text-white'
            }`}
            readOnly
          />
          <div className={`${!formData?.name || !formData?.description ? 
            'animate-pulse ring-2 ring-blue-500 rounded-md ring-opacity-75 shadow-lg shadow-blue-500/50' : ''}`}>
            <CompanyEditDialog/>
          </div>

          {formData?.parentCanvasId && (
            <Button
              onClick={handleParentCanvasClick}
              variant="outline"
              className={`flex items-center gap-1 text-sm ${
                canvasTheme === 'light'
                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <span>Parent Canvas</span>
              <ArrowUpRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Input
          id="designedFor"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed For"
          value={formData?.designedFor || ''}
          onChange={onInputChange}
        />
        <Input
          id="designedBy"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Designed By"
          value={formData?.designedBy || ''}
          onChange={onInputChange}
        />
        <Input
          id="date"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="date"
          placeholder="Date"
          value={formData?.date || ''}
          onChange={onInputChange}
        />
        <Input
          id="version"
          canvasTheme={canvasTheme}
          className={`max-w-[150px] ${
            canvasTheme === 'light' ? 'text-black' : 'text-white'
          }`}
          type="text"
          placeholder="Version"
          value={formData?.version || ''}
          onChange={onInputChange}
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`${
                canvasTheme === 'light'
                  ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900'
                  : 'bg-gray-950 text-gray-300 border-gray-800 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setShowLayoutEditor(true)}>
              <Grid2x2 className="h-4 w-4 mr-2" />
              Layout Editor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/canvas/${formData.id}/screenshot`)}>
              <Printer className="h-4 w-4 mr-2" />
              Screenshot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCanvasTheme(canvasTheme === 'light' ? 'dark' : 'light')}>
              {canvasTheme === 'light' ? (
                <Moon className="h-4 w-4 mr-2" />
              ) : (
                <Sun className="h-4 w-4 mr-2" />
              )}
              Toggle Theme
            </DropdownMenuItem>
            {(formData?.parentCanvasId || getChildCanvases(formData).length > 0) && (
              <>
                <DropdownMenuLabel>Linked Canvases</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={handleParentCanvasClick}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Parent Canvas
                </DropdownMenuItem>
                
                {getChildCanvases(formData).length > 0 && (
                  <>
                    {getChildCanvases(formData).map((item, index) => {
                      const [sectionName, _] = findSectionForItem(item.id) || [];
                      
                      return (
                        <DropdownMenuItem 
                          key={item.id}
                          onClick={() => {
                            localStorage.setItem('lastCanvasId', item.canvasLink!.canvasId)
                            router.push(`/canvas/${item.canvasLink!.canvasId}`)
                          }}
                          onMouseEnter={() => setHoveredItemId(item.id)}
                          onMouseLeave={() => setHoveredItemId(null)}
                          className="flex items-center gap-2"
                        >
                          <ArrowDownRight className="h-4 w-4 mr-2" />
                          <div className="flex flex-col flex-1">
                          {sectionName && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <DynamicIcon 
                                  name={formData.canvasType?.sections.find(section => section.name === sectionName)?.icon || 'Square'} 
                                  className="h-3 w-3" 
                                /> 
                                {sectionName}
                              </span>
                            )}
                            <span className="line-clamp-1">
                              {item instanceof TextSectionItem ? item.content : `Child Canvas ${index + 1}`}
                            </span>
                            
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
                <DropdownMenuSeparator />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <LayoutEditor 
        open={showLayoutEditor} 
        onOpenChange={setShowLayoutEditor}
      />
    </div>
  )
} 