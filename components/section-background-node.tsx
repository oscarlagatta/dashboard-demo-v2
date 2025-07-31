import type { NodeProps } from "@xyflow/react"

const SectionBackgroundNode = ({ data }: NodeProps<{ title: string }>) => {
  return (
    <div className="h-full w-full rounded-lg border-2 border-gray-300 [border-style:inset]">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-700">{data.title}</h2>
      </div>
    </div>
  )
}

export default SectionBackgroundNode
