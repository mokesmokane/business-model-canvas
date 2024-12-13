import { Handle, Position } from 'reactflow'
import { Canvas, CanvasHierarchyNode } from '@/types/canvas'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface CanvasNodeProps {
  data: {
    canvas: CanvasHierarchyNode
  }
}

export function CanvasNode({ data }: CanvasNodeProps) {
  const { canvas } = data

  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-background border min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-medium truncate">{canvas.title}</div>
          <Link href={`/canvas/${canvas.id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="text-xs text-muted-foreground">{canvas.type}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

