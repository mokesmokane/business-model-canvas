import { Handle, Position } from 'reactflow'
import { Canvas } from '@/types/canvas'

interface CanvasNodeProps {
  data: {
    canvas: Canvas
  }
}

export function CanvasNode({ data }: CanvasNodeProps) {
  const { canvas } = data

  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-background border min-w-[200px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="flex flex-col gap-1">
        <div className="font-medium truncate">{canvas.title}</div>
        <div className="text-xs text-muted-foreground">{canvas.type}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </div>
  )
}

