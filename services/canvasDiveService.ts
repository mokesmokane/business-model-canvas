import { Canvas, Section } from '@/types/canvas'
import { CanvasType } from '@/types/canvas-sections'
import { v4 as uuidv4 } from 'uuid'

interface DiveInResponse {
  suggestions: Array<{
    canvasTypeId: string
    rationale: string
    initialContent: {
      name: string
      description: string
      sections: Record<string, string[]>
    }
  }>
  newCanvasType?: {
    name: string
    description: string
    sections: Array<{
      name: string
      placeholder: string
    }>
    rationale: string
    initialContent: {
      name: string
      description: string
      sections: Record<string, string[]>
    }
  }
}

export async function getCanvasDiveSuggestions(
  parentCanvas: Canvas,
  sectionKey: string,
  itemId: string
): Promise<DiveInResponse> {
  const section = parentCanvas.sections.get(sectionKey)
  if (!section) {
    console.error('Section not found', sectionKey)
    console.log(parentCanvas)
    throw new Error('Section not found')
  }

  const item = section.sectionItems.find(i => i.id === itemId)
  if (!item) {
    throw new Error('Item not found')
  }

  const response = await fetch('/api/ai-canvas-dive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parentCanvas: {
        id: parentCanvas.id,
        name: parentCanvas.name,
        type: parentCanvas.canvasType,
        sections: Object.fromEntries(parentCanvas.sections)
      },
      section: {
        id: sectionKey,
        name: section.name,
        placeholder: parentCanvas.canvasType.sections.find(s => s.name === section.name)?.placeholder || ''
      },
      item: {
        id: itemId,
        content: item
      }
    })
  })

  if (!response.ok) {
    throw new Error('Failed to get canvas dive suggestions')
  }

  return await response.json()
}

export async function createLinkedCanvas(
  parentCanvas: Canvas,
  sectionKey: string,
  itemId: string,
  selectedCanvasType: CanvasType,
  initialContent: {
    name: string
    description: string
    sections: Record<string, string[]>
  }
): Promise<void> {
  const newCanvasId = uuidv4()
  
  // // Create the new canvas
  // const newCanvas: Canvas = {
  //   ...initialContent,
  //   id: newCanvasId,
  //   canvasType: selectedCanvasType,
  //   canvasLayout: selectedCanvasType.defaultLayout!.layout,
  //   date: new Date().toISOString(),
  //   version: '1.0',
  //   designedFor: parentCanvas.designedFor,
  //   designedBy: parentCanvas.designedBy,
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  //   sections: new Map(),
  //   parentCanvas: {
  //     id: parentCanvas.id,
  //     name: parentCanvas.name,
  //     sectionId: sectionKey,
  //     itemId: itemId
  //   }
  // }

  // // Initialize sections with the provided content
  // selectedCanvasType.sections.forEach(sectionTemplate => {
  //   const sectionContent = initialContent.sections[sectionTemplate.name] || []
  //   newCanvas.sections.set(sectionTemplate.name, {
  //     name: sectionTemplate.name,
  //     gridIndex: sectionTemplate.gridIndex,
  //     items: sectionContent,
  //     qAndAs: []
  //   })
  // })

  // // Update the parent canvas with the link
  // if (!parentCanvas.linkedItems) {
  //   parentCanvas.linkedItems = {}
  // }
  // parentCanvas.linkedItems[itemId] = {
  //   canvasId: newCanvasId,
  //   canvasName: newCanvas.name
  // }

  // // TODO: Save both canvases to your storage system
  // // This will depend on your storage implementation
  // // await saveCanvas(newCanvas)
  // // await updateCanvas(parentCanvas)

  // return newCanvas
} 