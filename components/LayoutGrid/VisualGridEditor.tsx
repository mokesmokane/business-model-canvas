"use client"

import React, { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Plus, Save, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cssToGridItems, gridItemsToCss } from './utils'
import { GridItem } from './gridTypes'
import { CanvasSection, CanvasType } from '@/types/canvas-sections'
import DynamicIcon from '@/components/Util/DynamicIcon'
import { SectionEditDialog } from './SectionEditDialog'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface VisualGridEditorProps {
  initialAreas: string[]
  initialCols: string
  initialRows: string
  onChange: (areas: string[], cols: string, rows: string) => void
  canvasType: CanvasType
  showGridAreas: boolean
  onUpdateSection: (updatedSection: CanvasSection) => void
  onAddSection: (section: CanvasSection) => void
  onDeleteSection: (index: number) => void
}

export function VisualGridEditor({ 
  initialAreas, 
  initialCols, 
  initialRows, 
  onChange,
  canvasType,
  showGridAreas,
  onUpdateSection,
  onAddSection,
  onDeleteSection
}: VisualGridEditorProps) {
  
  const [gridItems, setGridItems] = useState<GridItem[]>([])
  const [editingSection, setEditingSection] = useState<CanvasSection | null>(null)

  useEffect(() => {
    if (initialRows.includes('repeat')) {
      console.error('Invalid row definition: "repeat" syntax is not supported.')
      return
    }

    const initialItems = cssToGridItems(initialAreas, initialCols, initialRows)
    setGridItems(initialItems)
  }, [initialAreas, initialCols, initialRows])

  const onLayoutChange = (layout: GridItem[]) => {
    const newItems = layout.map(item => ({
      ...item,
      w: Math.max(item.w, 1),
      h: Math.max(item.h, 1),
    }))
    setGridItems(newItems)
    
    const { areas, cols, rows } = gridItemsToCss(newItems)
    
    onChange(areas, cols, rows)
  }

  // Set a fixed number of columns for consistent sizing
  const fixedCols = 12;
  const rowHeight = 50;

  const handleAddSection = () => {
    // Create new section
    const newSection: CanvasSection = {
      name: 'New Section',
      icon: 'Square',
      placeholder: '',
      gridIndex: canvasType.sections.length
    };

    // Create new grid item
    const newGridItem: GridItem = {
      i: gridItems.length.toString(),
      x: 0, // Default x position
      y: gridItems.length, // Stack vertically
      w: 3, // Default width
      h: 2, // Default height
    };

    // Update grid items
    const newGridItems = [...gridItems, newGridItem];
    setGridItems(newGridItems);

    // Update layout
    const { areas, cols, rows } = gridItemsToCss(newGridItems);
    onChange(areas, cols, rows);

    // Add section
    onAddSection(newSection);
  };

  const handleDeleteSection = (index: number) => {
    // Remove the grid item
    const newGridItems = gridItems.filter((_, i) => i !== index);
    setGridItems(newGridItems);

    // Update the layout
    const { areas, cols, rows } = gridItemsToCss(newGridItems);
    onChange(areas, cols, rows);

    // Call parent's delete handler
    onDeleteSection(index);
  };

  return (
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Visual Grid Editor</span>
          <Button onClick={handleAddSection}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {showGridAreas && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Initial Grid Areas:</div>
          <div className="space-y-1">
            {initialAreas.map((area, index) => (
              <code key={index} className="text-sm block">{area}</code>
            ))}
          </div>
        </div>
        )}
        <ResponsiveGridLayout
          className="layout bg-gray-50 border rounded-lg"
          layouts={{ lg: gridItems }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: fixedCols, md: fixedCols, sm: fixedCols, xs: fixedCols, xxs: fixedCols }}
          rowHeight={rowHeight}
          width={1200}
          onLayoutChange={onLayoutChange}
          compactType={null}
          preventCollision={true}
          isResizable={true}
          isDraggable={true}
        >
          {gridItems.map((item, index) => {
            const section = canvasType?.sections[index];
            return (
              <div
                key={item.i}
                className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg p-4 flex flex-col gap-2 shadow-md cursor-move border-2 border-dashed border-primary/20"
              >
                {section ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DynamicIcon name={section.icon} className="h-4 w-4 text-primary" />
                        <div className="font-medium text-primary">{section.name}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingSection(section)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSection(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {section.placeholder && (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {section.placeholder}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="font-bold text-muted-foreground">Area {parseInt(item.i) + 1}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.w}x{item.h}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
        {editingSection && (
          <SectionEditDialog
            open={!!editingSection}
            onOpenChange={(open) => !open && setEditingSection(null)}
            section={editingSection}
            onSave={(updatedSection) => {
              if (onUpdateSection) {
                onUpdateSection(updatedSection);
              }
              setEditingSection(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

