'use client'

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import dagre from 'dagre'
import { CanvasHierarchyNode } from '@/types/canvas'
import { CanvasNode } from './CanvasNode'
import 'reactflow/dist/style.css'

const nodeTypes = {
  canvas: CanvasNode,
}

interface CanvasHierarchyProps {
  canvases: CanvasHierarchyNode[]
}

export function CanvasHierarchy({ canvases }: CanvasHierarchyProps) {
  // Create a layout using dagre
  const { initialNodes, initialEdges } = useMemo(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: 'TB', nodesep: 50, ranksep: 100 })

    // Create nodes
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    function processCanvas(canvas: CanvasHierarchyNode, level: number = 0) {
      const node: Node = {
        id: canvas.id,
        type: 'canvas',
        position: { x: 0, y: 0 }, // Will be calculated by dagre
        data: { canvas },
      }
      
      nodes.push(node)
      dagreGraph.setNode(canvas.id, { width: 200, height: 80 })
      
      if (canvas.parentId) {
        const edge: Edge = {
          id: `${canvas.parentId}-${canvas.id}`,
          source: canvas.parentId,
          target: canvas.id,
        }
        edges.push(edge)
        dagreGraph.setEdge(canvas.parentId, canvas.id)
      }
      
      if (canvas.children) {
        canvas.children.forEach(child => processCanvas(child, level + 1))
      }
    }

    canvases.forEach(canvas => processCanvas(canvas))
    
    // Calculate layout
    dagre.layout(dagreGraph)
    
    // Apply calculated positions
    nodes.forEach(node => {
      const nodeWithPosition = dagreGraph.node(node.id)
      node.position = {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      }
    })

    return { initialNodes: nodes, initialEdges: edges }
  }, [canvases])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView()
  }, [])

  return (
    <div className="w-full h-[800px] bg-muted/40 rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        className="bg-background"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

