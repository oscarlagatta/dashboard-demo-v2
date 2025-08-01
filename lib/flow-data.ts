import { type Node, type Edge, MarkerType } from "@xyflow/react"
import apiData from "./api-data.json"

// Define a custom type for our application's node data, which uses parentId
export type AppNode = Omit<Node, "parentNode"> & {
  parentId?: string
}

// --- Static Section Definitions ---
const backgroundNodes: AppNode[] = [
  {
    id: "bg-origination",
    type: "background",
    position: { x: 0, y: 0 },
    data: { title: "Origination" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "350px", height: "960px" },
  },
  {
    id: "bg-validation",
    type: "background",
    position: { x: 350, y: 0 },
    data: { title: "Payment Validation and Routing" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "350px", height: "960px" },
  },
  {
    id: "bg-middleware",
    type: "background",
    position: { x: 700, y: 0 },
    data: { title: "Middleware" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "450px", height: "960px" },
  },
  {
    id: "bg-processing",
    type: "background",
    position: { x: 1150, y: 0 },
    data: { title: "Payment Processing, Sanctions & Investigation" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "500px", height: "960px" },
  },
]

// --- Data Transformation Logic ---

const classToParentId: Record<string, string> = {
  origination: "bg-origination",
  "payment validation and routing": "bg-validation",
  middleware: "bg-middleware",
  "payment processing, sanctions and investigation": "bg-processing",
}

const sectionPositions: Record<string, { baseX: number; positions: { x: number; y: number }[] }> = {
  "bg-origination": {
    baseX: 50,
    positions: [
      { x: 50, y: 100 },
      { x: 50, y: 220 },
      { x: 50, y: 340 },
      { x: 50, y: 460 },
      { x: 50, y: 580 },
      { x: 50, y: 700 },
    ],
  },
  "bg-validation": {
    baseX: 425,
    positions: [
      { x: 425, y: 100 },
      { x: 425, y: 220 },
      { x: 425, y: 340 },
      { x: 425, y: 480 },
      { x: 425, y: 590 },
      { x: 425, y: 700 },
    ],
  },
  "bg-middleware": {
    baseX: 750,
    positions: [
      { x: 750, y: 220 },
      { x: 950, y: 400 },
    ],
  },
  "bg-processing": {
    baseX: 1200,
    positions: [
      { x: 1200, y: 160 },
      { x: 1420, y: 160 },
      { x: 1310, y: 300 },
      { x: 1310, y: 420 },
      { x: 1200, y: 580 },
      { x: 1200, y: 700 },
      { x: 1200, y: 820 },
    ],
  },
}

function transformApiData() {
  const sectionCounters: Record<string, number> = {
    "bg-origination": 0,
    "bg-validation": 0,
    "bg-middleware": 0,
    "bg-processing": 0,
  }

  const transformedNodes: AppNode[] = apiData.nodes
    .map((apiNode) => {
      const parentId = classToParentId[apiNode.class]
      if (!parentId) return null

      const sectionConfig = sectionPositions[parentId]
      const positionIndex = sectionCounters[parentId]++
      const position = sectionConfig.positions[positionIndex] || {
        x: sectionConfig.baseX,
        y: 100 + positionIndex * 120,
      }

      return {
        id: apiNode.id,
        type: "custom",
        position,
        data: { title: apiNode.data.label, subtext: `AIT ${apiNode.id}` },
        parentId: parentId,
        extent: "parent",
      }
    })
    .filter((n): n is AppNode => n !== null)

  const edgeStyle = { stroke: "#6b7280", strokeWidth: 2 }
  const markerEnd = { type: MarkerType.ArrowClosed, color: "#6b7280" }

  const transformedEdges = apiData.edges.flatMap((apiEdge) => {
    const { source, target } = apiEdge
    if (Array.isArray(target)) {
      // If target is an array, create multiple edges
      return target.map((t) => ({
        id: `${source}-${t}`,
        source: source,
        target: t,
        type: "smoothstep",
        style: edgeStyle, // Use solid line style
        markerEnd,
      }))
    } else {
      // If target is a single string, create one edge
      return [
        {
          ...apiEdge,
          target: target,
          type: "smoothstep",
          style: edgeStyle, // Use solid line style
          markerEnd,
        },
      ]
    }
  })

  return {
    nodes: [...backgroundNodes, ...transformedNodes],
    edges: transformedEdges,
  }
}

const { nodes, edges } = transformApiData()

export const initialNodes: AppNode[] = nodes
export const initialEdges: Edge[] = edges
