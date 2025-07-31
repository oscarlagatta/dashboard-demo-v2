"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
  ReactFlowProvider,
  useViewport,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { initialNodes, initialEdges, type AppNode } from "@/lib/flow-data"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"

// Explicitly type the nodeTypes object.
// This ensures all components passed in are compatible with React Flow.
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

// This function transforms our app's node data (with `parentId`)
// into the format React Flow expects (with `parentNode`).
const transformNodes = (nodes: AppNode[]): Node[] => {
  return nodes.map((node) => {
    if (node.parentId) {
      const { parentId, ...rest } = node
      return { ...rest, parentNode: parentId }
    }
    return node as Node
  })
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35] // Proportions must sum to 1
const GAP_WIDTH = 16 // The gap between sections in pixels

const Flow = () => {
  // Transform nodes once before setting state
  const reactFlowNodes = useMemo(() => transformNodes(initialNodes), [])
  const [nodes, setNodes] = useState<Node[]>(reactFlowNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const { width, height } = useViewport()

  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((nds) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0
        const newNodes = [...nds]

        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: { x: currentX, y: 0 },
              style: {
                ...newNodes[nodeIndex].style,
                width: `${sectionWidth}px`,
                height: `${height}px`,
              },
            }
            currentX += sectionWidth + GAP_WIDTH
          }
        }
        return newNodes
      })
    }
  }, [width, height])

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  )

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            style: { strokeWidth: 2, stroke: "#6b7280" },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      className="bg-white"
    >
      <Controls />
      <Background gap={16} size={1} />
    </ReactFlow>
  )
}

export default function FlowDiagram() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
