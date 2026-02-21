import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { concepts, categories } from '@/data/index'
import { buildGraphData, getNeighborhood, findConceptNodes } from '@/lib/graph-utils'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'

import GraphCanvas, { type GraphCanvasHandle } from '@/components/explore/graph-canvas'
import GraphControls from '@/components/explore/graph-controls'
import GraphZoomControls from '@/components/explore/graph-zoom-controls'
import GraphSidePanel from '@/components/explore/graph-side-panel'

const ExplorePage: React.FC = () => {
    const { conceptId: urlConceptId } = useParams<{ conceptId?: string }>()
    const navigate = useNavigate()
    const canvasRef = useRef<GraphCanvasHandle>(null)

    const [selectedConceptId, setSelectedConceptId] = useState<string | null>(urlConceptId || null)
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [visibleCategories, setVisibleCategories] = useState<Set<string>>(() => {
        const allCats = (categories as string[]).filter((c) => c !== 'All')
        return new Set(allCats)
    })

    const { markAsExplored, isExplored } = useExploredConcepts()

    const isLocalView = !!urlConceptId

    // Mark concept as explored when selected
    useEffect(() => {
        if (selectedConceptId) {
            markAsExplored(selectedConceptId)
        }
    }, [selectedConceptId, markAsExplored])

    // Prevent body scroll on this page (full-viewport graph)
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    // Build concept lookup
    const conceptMap = useMemo(() => {
        const map = new Map<string, Concept>()
        for (const c of concepts) {
            map.set(c.id, c)
        }
        return map
    }, [])

    // All categories except "All"
    const allCategories = useMemo(() => (categories as string[]).filter((c) => c !== 'All'), [])

    // Build full graph data
    const fullGraphData = useMemo(
        () => buildGraphData(concepts as Concept[], visibleCategories),
        [visibleCategories]
    )

    // Compute displayed graph: full or neighborhood
    const displayedGraphData = useMemo(() => {
        if (isLocalView && urlConceptId) {
            return getNeighborhood(fullGraphData, urlConceptId, 2)
        }
        return fullGraphData
    }, [fullGraphData, isLocalView, urlConceptId])

    // Search highlighting
    const highlightedNodeIds = useMemo(() => {
        if (!searchQuery.trim()) return new Set<string>()
        const matches = findConceptNodes(displayedGraphData.nodes, searchQuery)
        return new Set(matches.map((n) => n.id))
    }, [displayedGraphData.nodes, searchQuery])

    // Zoom to first search match
    useEffect(() => {
        if (highlightedNodeIds.size > 0 && canvasRef.current) {
            const firstId = highlightedNodeIds.values().next().value
            const node = displayedGraphData.nodes.find((n) => n.id === firstId)
            if (node) {
                // The node object will have x/y after simulation
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const n = node as any
                if (n.x != null && n.y != null) {
                    canvasRef.current.centerAt(n.x, n.y, 400)
                    canvasRef.current.zoom(4, 400)
                }
            }
        }
    }, [highlightedNodeIds, displayedGraphData.nodes])

    // Sync URL concept to selection
    useEffect(() => {
        setSelectedConceptId(urlConceptId || null)
    }, [urlConceptId])

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedConceptId(nodeId)
    }, [])

    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHoveredNodeId(nodeId)
    }, [])

    const handleBackgroundClick = useCallback(() => {
        setSelectedConceptId(null)
    }, [])

    const handleExploreNeighbors = useCallback(
        (conceptId: string) => {
            navigate(`/explore/${conceptId}`)
        },
        [navigate]
    )

    const handleNavigateToConcept = useCallback(
        (conceptId: string) => {
            navigate(`/explore/${conceptId}`)
        },
        [navigate]
    )

    const handleToggleCategory = useCallback((category: string) => {
        setVisibleCategories((prev) => {
            const next = new Set(prev)
            if (next.has(category)) {
                next.delete(category)
            } else {
                next.add(category)
            }
            return next
        })
    }, [])

    const handleShowAll = useCallback(() => {
        setVisibleCategories(new Set(allCategories))
    }, [allCategories])

    const handleHideAll = useCallback(() => {
        setVisibleCategories(new Set())
    }, [])

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query)
    }, [])

    const selectedConcept = selectedConceptId ? conceptMap.get(selectedConceptId) || null : null

    return (
        <div className='relative w-full overflow-hidden' style={{ height: 'calc(100vh - 64px)' }}>
            {/* Back to global view button when in local view */}
            {isLocalView && (
                <button
                    onClick={() => navigate('/explore')}
                    className='bg-surface/90 text-primary/70 border-primary/10 hover:text-primary absolute z-20 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-sm transition-colors'
                    style={{ top: '0.75rem', left: '50%', transform: 'translateX(-50%)' }}
                >
                    Global View
                </button>
            )}

            <GraphCanvas
                ref={canvasRef}
                graphData={displayedGraphData}
                selectedNodeId={selectedConceptId}
                hoveredNodeId={hoveredNodeId}
                highlightedNodeIds={highlightedNodeIds}
                isLocalView={isLocalView}
                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onBackgroundClick={handleBackgroundClick}
            />

            <GraphControls
                nodeCount={displayedGraphData.nodes.length}
                linkCount={displayedGraphData.links.length}
                isLocalView={isLocalView}
                visibleCategories={visibleCategories}
                allCategories={allCategories}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                onToggleCategory={handleToggleCategory}
                onShowAll={handleShowAll}
                onHideAll={handleHideAll}
            />

            <GraphZoomControls canvasRef={canvasRef} />

            <GraphSidePanel
                concept={selectedConcept}
                isOpen={!!selectedConcept}
                isExplored={isExplored}
                conceptMap={conceptMap}
                onClose={() => setSelectedConceptId(null)}
                onExploreNeighbors={handleExploreNeighbors}
                onNavigateToConcept={handleNavigateToConcept}
            />
        </div>
    )
}

export default ExplorePage
