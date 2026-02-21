import { useCallback, useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type { ForceGraphMethods } from 'react-force-graph-2d'
import { useTheme } from '@/contexts/theme-context'
import type { GraphData, GraphNode } from '@/lib/graph-utils'

export interface GraphCanvasHandle {
    centerAt: (x?: number, y?: number, ms?: number) => void
    zoom: (scale: number, ms?: number) => void
    zoomToFit: (ms?: number, padding?: number) => void
}

interface GraphCanvasProps {
    graphData: GraphData
    selectedNodeId: string | null
    hoveredNodeId: string | null
    highlightedNodeIds: Set<string>
    isLocalView: boolean
    onNodeClick: (nodeId: string) => void
    onNodeHover: (nodeId: string | null) => void
    onBackgroundClick: () => void
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
    (
        {
            graphData,
            selectedNodeId,
            hoveredNodeId,
            highlightedNodeIds,
            isLocalView,
            onNodeClick,
            onNodeHover,
            onBackgroundClick
        },
        ref
    ) => {
        const { theme } = useTheme()
        const fgRef = useRef<ForceGraphMethods>(undefined)
        const containerRef = useRef<HTMLDivElement>(null)
        const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

        useImperativeHandle(ref, () => ({
            centerAt: (x?: number, y?: number, ms?: number) => {
                fgRef.current?.centerAt(x, y, ms)
            },
            zoom: (scale: number, ms?: number) => {
                fgRef.current?.zoom(scale, ms)
            },
            zoomToFit: (ms?: number, padding?: number) => {
                fgRef.current?.zoomToFit(ms ?? 400, padding ?? 40)
            }
        }))

        // Track container dimensions
        useEffect(() => {
            const container = containerRef.current
            if (!container) return

            const observer = new ResizeObserver((entries) => {
                const entry = entries[0]
                if (entry) {
                    setDimensions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    })
                }
            })
            observer.observe(container)
            return () => observer.disconnect()
        }, [])

        // Fit to screen on data change
        useEffect(() => {
            const timer = setTimeout(() => {
                fgRef.current?.zoomToFit(400, 40)
            }, 500)
            return () => clearTimeout(timer)
        }, [graphData])

        // Build neighbor sets for highlighting on hover
        const neighborSets = useRef(new Map<string, Set<string>>())
        useEffect(() => {
            const adj = new Map<string, Set<string>>()
            for (const link of graphData.links) {
                const src =
                    typeof link.source === 'object' ? (link.source as GraphNode).id : link.source
                const tgt =
                    typeof link.target === 'object' ? (link.target as GraphNode).id : link.target
                if (!adj.has(src)) adj.set(src, new Set())
                if (!adj.has(tgt)) adj.set(tgt, new Set())
                adj.get(src)!.add(tgt)
                adj.get(tgt)!.add(src)
            }
            neighborSets.current = adj
        }, [graphData])

        const bgColor = theme === 'dark' ? '#37404c' : '#f8f9fc'
        const linkColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        const linkColorLocal = theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'

        const handleNodeClick = useCallback(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (node: any) => {
                if (node?.id) onNodeClick(node.id as string)
            },
            [onNodeClick]
        )

        const handleNodeHover = useCallback(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (node: any) => {
                onNodeHover(node?.id ? (node.id as string) : null)
            },
            [onNodeHover]
        )

        const handleBackgroundClick = useCallback(() => {
            onBackgroundClick()
        }, [onBackgroundClick])

        const nodeCanvasObject = useCallback(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const gNode = node as GraphNode & { x: number; y: number }
                const { x, y, size, color, name, id } = gNode
                if (x == null || y == null) return

                const isSelected = id === selectedNodeId
                const isHovered = id === hoveredNodeId
                const isSearchHighlighted =
                    highlightedNodeIds.size > 0 && highlightedNodeIds.has(id)
                const isNeighborOfHovered =
                    hoveredNodeId && neighborSets.current.get(hoveredNodeId)?.has(id)
                const isDimmed =
                    (hoveredNodeId && id !== hoveredNodeId && !isNeighborOfHovered) ||
                    (highlightedNodeIds.size > 0 && !isSearchHighlighted)

                const radius = size

                // Glow for hovered node
                if (isHovered) {
                    ctx.beginPath()
                    ctx.arc(x, y, radius + 4, 0, 2 * Math.PI)
                    ctx.fillStyle = color + '40'
                    ctx.fill()
                }

                // Highlight ring for selected node
                if (isSelected) {
                    ctx.beginPath()
                    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI)
                    ctx.strokeStyle = '#e5007d'
                    ctx.lineWidth = 2 / globalScale
                    ctx.stroke()
                }

                // Main circle
                ctx.beginPath()
                ctx.arc(x, y, radius, 0, 2 * Math.PI)
                ctx.fillStyle = isDimmed ? color + '30' : color
                ctx.fill()

                // Label - for selected node and neighbors of hovered node
                // Hovered node itself gets a tooltip via nodeLabel prop
                if (isSelected || isNeighborOfHovered) {
                    const fontSize = Math.max(10 / globalScale, 2)
                    ctx.font = `${fontSize}px 'Noto Sans', sans-serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'top'
                    ctx.fillStyle = theme === 'dark' ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
                    ctx.fillText(name, x, y + radius + 2)
                }
            },
            [selectedNodeId, hoveredNodeId, highlightedNodeIds, theme]
        )

        const nodePointerAreaPaint = useCallback(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (node: any, paintColor: string, ctx: CanvasRenderingContext2D) => {
                const gNode = node as GraphNode & { x: number; y: number }
                const { x, y, size } = gNode
                if (x == null || y == null) return
                ctx.beginPath()
                ctx.arc(x, y, Math.max(size + 2, 6), 0, 2 * Math.PI)
                ctx.fillStyle = paintColor
                ctx.fill()
            },
            []
        )

        return (
            <div ref={containerRef} className='h-full w-full' style={{ touchAction: 'none' }}>
                <ForceGraph2D
                    ref={fgRef}
                    graphData={graphData}
                    width={dimensions.width}
                    height={dimensions.height}
                    backgroundColor={bgColor}
                    nodeCanvasObject={nodeCanvasObject}
                    nodeCanvasObjectMode={() => 'replace'}
                    nodePointerAreaPaint={nodePointerAreaPaint}
                    nodeLabel={(node) => (node as GraphNode).name}
                    linkColor={() => (isLocalView ? linkColorLocal : linkColor)}
                    linkWidth={isLocalView ? 1 : 0.5}
                    onNodeClick={handleNodeClick}
                    onNodeHover={handleNodeHover}
                    onBackgroundClick={handleBackgroundClick}
                    cooldownTicks={100}
                    warmupTicks={50}
                    enableNodeDrag={true}
                    minZoom={0.1}
                    maxZoom={20}
                />
            </div>
        )
    }
)

GraphCanvas.displayName = 'GraphCanvas'

export default GraphCanvas
