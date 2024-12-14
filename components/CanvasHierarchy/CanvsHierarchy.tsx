'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  useEdgesState,
  useNodesState,
  getBezierPath,
  EdgeTypes,
  BaseEdge,
  EdgeLabelRenderer,
} from 'reactflow'
import dagre from 'dagre'
import { CanvasHierarchyNode } from '@/types/canvas'
import { CanvasNode } from './CanvasNode'
import 'reactflow/dist/style.css'

const nodeTypes = {
  canvas: CanvasNode,
}

const CustomEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    label,
    ...props
  }: any) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  
    return (
      <>
        <BaseEdge path={edgePath} {...props} />
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all', // allow interaction if needed
            }}
            className="text-xs text-muted-foreground bg-white px-1 py-0.5 rounded"
          >
            {label || ''}
          </div>
        </EdgeLabelRenderer>
      </>
    );
  };
  

const edgeTypes = {
  custom: CustomEdge,
};

interface CanvasHierarchyProps {
  canvases: CanvasHierarchyNode[]
}

export function CanvasHierarchy({ canvases }: CanvasHierarchyProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  // Create initial layout
  const { initialNodes, initialEdges } = useMemo(() => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ 
      rankdir: 'TB', 
      nodesep: 250,  // Reduced by 50%
      ranksep: 350   // Reduced by 50%
    })

    // Create nodes
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    function processCanvas(canvas: CanvasHierarchyNode, level: number = 0) {
      const node: Node = {
        id: canvas.id,
        type: 'canvas',
        position: { x: 0, y: 0 }, // Will be calculated by dagre
        data: { 
          canvas,
          isHighlighted: hoveredNode ? canvas.id === hoveredNode : false,
          isParentHighlighted: false,
          highlightedSection: null,
          highlightItem: null,
          onNodeMouseEnter: (itemId?: string) => {
            console.log('onNodeMouseEnter', itemId)
            setHoveredNode(canvas.id)
            setHoveredItem(itemId || null)
          },
          onNodeMouseLeave: () => setHoveredNode(null),
        },
      }
      
      nodes.push(node)
      dagreGraph.setNode(canvas.id, { width: 100, height: 40 }) // Width and height reduced by 50%
      
      if (canvas.parentId) {
        console.log('Creating edge with data:', {
          parentId: canvas.parentId,
          parentSection: canvas.parentSection,
          parentSectionItem: canvas.parentSectionItem
        })

        const edge: Edge = {
          id: `${canvas.parentId}-${canvas.id}`,
          source: canvas.parentId,
          target: canvas.id,
          type: 'custom',
          label: canvas.parentSection || '',
          data: {
            sourceSection: canvas.parentSection,
            sourceItem: canvas.parentSectionItem || null
          }
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

  // Modified effect to only highlight sections and items
  useEffect(() => {
    if (!hoveredNode) {
      setNodes(currentNodes => 
        currentNodes.map(node => ({
          ...node,
          data: {
            ...node.data,
            highlightedSection: null,
            highlightItem: null,
            isHighlighted: false,
            isParentHighlighted: false
          }
        }))
      )
      return
    }

    const parentEdge = edges.find(edge => edge.target === hoveredNode)
    const sourceSection = parentEdge?.data?.sourceSection
    const sourceItem = parentEdge?.data?.sourceItem

    setNodes(currentNodes => 
      currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlightedSection: node.id === parentEdge?.source ? sourceSection : null,
          highlightItem: node.id === parentEdge?.source ? sourceItem : null,
          isHighlighted: node.id === hoveredNode,
          isParentHighlighted: node.id === parentEdge?.source
        }
      }))
    )
  }, [hoveredNode, edges, setNodes])

  const onInit = useCallback((reactFlowInstance: any) => {
    reactFlowInstance.fitView()
  }, [])

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-muted/40 rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{
          padding: 0.2, // Add padding around the viewport
          minZoom: 0.01, // Allow zooming out further
          maxZoom: 2
        }}
        defaultViewport={{ zoom: 0.01, x: 0, y: 0 }} // Set initial zoom level
        className="bg-background"
        onNodeMouseEnter={(_, node) => {
          console.log('ReactFlow node mouse enter:', node.id)
          setHoveredNode(node.id)
        }}
        onNodeMouseLeave={(_, node) => {
          console.log('ReactFlow node mouse leave:', node.id)
          setHoveredNode(null)
        }}
      >
        <Controls />
      </ReactFlow>
    </div>
  )
}

