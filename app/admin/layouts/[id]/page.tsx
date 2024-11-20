'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Grid2x2, Plus } from 'lucide-react'
import { CanvasTypeService } from '@/services/canvasTypeService'
import { CanvasLayoutDetails } from '@/types/canvas-sections'

const COLORS = [
  'bg-red-200',
  'bg-blue-200',
  'bg-green-200',
  'bg-yellow-200',
  'bg-purple-200',
  'bg-pink-200',
  'bg-indigo-200',
  'bg-teal-200',
]

export default function EditLayoutPage() {
  const params = useParams()
  const router = useRouter()
  const [layout, setLayout] = useState<CanvasLayoutDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gridItems, setGridItems] = useState<any[]>([])
  const canvasTypeService = new CanvasTypeService()

  useEffect(() => {
    loadLayout()
  }, [params.id])

  const loadLayout = async () => {
    try {
      const layouts = await canvasTypeService.getCanvasLayouts()
      const layout = layouts[params.id as string]
      if (!layout) {
        setError('Layout not found')
        return
      }
      setLayout(layout)
      initializeGridItems(layout)
    } catch (err) {
      setError('Failed to load layout')
      console.error(err)
    }
  }

  const initializeGridItems = (layout: CanvasLayoutDetails) => {
    const items = layout.layout.areas.map((area, index) => {
      const [startCol, startRow, endCol, endRow] = area.split('/').map(num => parseInt(num.trim()))
      return {
        i: index.toString(),
        x: startCol - 1,
        y: startRow - 1,
        w: endCol - startCol,
        h: endRow - startRow,
      }
    })
    setGridItems(items)
  }

  const handleLayoutChange = (newLayout: any) => {
    const updatedAreas = newLayout.map((item: any) => 
      `${item.y + 1} / ${item.x + 1} / ${item.y + item.h + 1} / ${item.x + item.w + 1}`
    )
    setLayout(prevLayout => ({
      ...prevLayout!,
      layout: {
        ...prevLayout!.layout,
        areas: updatedAreas,
      },
    }))
    setGridItems(newLayout)
  }

  const handleSave = async () => {
    if (!layout) return
    try {
      await canvasTypeService.updateCanvasLayout(params.id as string, layout)
      router.push('/admin')
    } catch (err) {
      setError('Failed to save layout')
      console.error(err)
    }
  }

  const addNewArea = () => {
    const newIndex = gridItems.length
    setGridItems([...gridItems, { i: newIndex.toString(), x: 0, y: 0, w: 1, h: 1 }])
    setLayout(prevLayout => ({
      ...prevLayout!,
      layout: {
        ...prevLayout!.layout,
        areas: [...prevLayout!.layout.areas, '1 / 1 / 2 / 2'],
      },
    }))
  }

  const removeArea = (index: number) => {
    setGridItems(gridItems.filter((_, i) => i !== index))
    setLayout(prevLayout => ({
      ...prevLayout!,
      layout: {
        ...prevLayout!.layout,
        areas: prevLayout!.layout.areas.filter((_, i) => i !== index),
      },
    }))
  }

  if (!layout) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8 flex flex-col h-screen">
      <h1 className="text-3xl font-bold mb-8">Edit Layout</h1>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Layout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={layout.name}
              onChange={(e) => setLayout({ ...layout, name: e.target.value })}
              placeholder="Layout Name"
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-sm font-medium">Grid Template</label>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  value={layout.layout.gridTemplate.columns}
                  onChange={(e) => setLayout({
                    ...layout,
                    layout: {
                      ...layout.layout,
                      gridTemplate: {
                        ...layout.layout.gridTemplate,
                        columns: e.target.value
                      }
                    }
                  })}
                  placeholder="Grid Columns (e.g., 1fr 1fr 1fr)"
                />
                <Input
                  value={layout.layout.gridTemplate.rows}
                  onChange={(e) => setLayout({
                    ...layout,
                    layout: {
                      ...layout.layout,
                      gridTemplate: {
                        ...layout.layout.gridTemplate,
                        rows: e.target.value
                      }
                    }
                  })}
                  placeholder="Grid Rows (e.g., auto auto)"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Grid Areas</label>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto h-[120px] text-sm">
                {layout.layout.areas.map((area, index) => `Area ${index + 1}: ${area}\n`).join('')}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>Visual Grid Editor</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="mb-4">
            <Button onClick={addNewArea} className="mr-2">
              <Plus className="mr-2 h-4 w-4" /> Add Area
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4 border rounded-lg p-4 bg-gray-50 h-full">
            {gridItems.map((item, index) => (
              <div
                key={item.i}
                className={`${COLORS[index % COLORS.length]} rounded-lg p-2 flex flex-col justify-between col-span-${item.w} row-span-${item.h}`}
                style={{ gridColumnStart: item.x + 1, gridRowStart: item.y + 1 }}
              >
                <div className="font-bold text-gray-700">Area {parseInt(item.i) + 1}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}