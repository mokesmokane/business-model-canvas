"use client"

import React, { useState, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cssToGridItems, gridItemsToCss } from './utils'
import { GridItem } from './gridTypes'

const ResponsiveGridLayout = WidthProvider(Responsive)

const COLORS = ['bg-red-200', 'bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-pink-200']

interface VisualGridEditorProps {
  initialAreas: string[]
  initialCols: string
  initialRows: string
  onChange: (areas: string[], cols: string, rows: string) => void
}

export function VisualGridEditor({ initialAreas, initialCols, initialRows, onChange }: VisualGridEditorProps) {
    console.log('initialAreas', initialAreas)
    console.log('initialCols', initialCols)
    console.log('initialRows', initialRows)
  const [gridItems, setGridItems] = useState<GridItem[]>([])

  useEffect(() => {
    if (initialRows.includes('repeat')) {
      console.error('Invalid row definition: "repeat" syntax is not supported.')
      return
    }

    const initialItems = cssToGridItems(initialAreas, initialCols, initialRows)
    setGridItems(initialItems)
  }, [initialAreas, initialCols, initialRows])

  const addNewArea = () => {
    const newItem: GridItem = {
      i: gridItems.length.toString(),
      x: (gridItems.length * 3) % 12,
      y: Infinity, // puts it at the bottom
      w: 3,
      h: 2
    }
    setGridItems([...gridItems, newItem])
  }

  const onLayoutChange = (layout: GridItem[]) => {
    const newItems = layout.map(item => ({
        ...item,
        w: Math.max(item.w, 1), // Ensure minimum width of 1
      h: Math.max(item.h, 1), // Ensure minimum height of 1
    }))
    setGridItems(newItems)
    
    const { areas, cols, rows } = gridItemsToCss(newItems)
    onChange(areas, cols, rows)
  }

  // Set a fixed number of columns for consistent sizing
  const fixedCols = 12;
  const rowHeight = 50; // Fixed row height for consistent sizing

  return (
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle>Visual Grid Editor</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveGridLayout
          className="layout bg-gray-50 border rounded-lg p-4"
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
          {gridItems.map((item, index) => (
            <div
              key={item.i}
              className={`${COLORS[index % COLORS.length]} rounded-lg p-2 flex flex-col justify-between shadow-md cursor-move`}
            >
              <div className="font-bold text-gray-700">Area {parseInt(item.i) + 1}</div>
              <div className="text-xs text-gray-600">
                {item.w}x{item.h}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </CardContent>
    </Card>
  )
}

