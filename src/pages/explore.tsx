import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
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
    const [searchParams, setSearchParams] = useSearchParams()
    const canvasRef = useRef<GraphCanvasHandle>(null)
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout>>(null)

    // All categories except "All"
    const allCategories = useMemo(() => (categories as string[]).filter((c) => c !== 'All'), [])

    const [selectedConceptId, setSelectedConceptId] = useState<string | null>(urlConceptId || null)
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

    // Initialize search and categories from URL params
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '')
    const [visibleCategories, setVisibleCategories] = useState<Set<string>>(() => {
        const hideParam = searchParams.get('hide')
        if (hideParam) {
            const hidden = new Set(hideParam.split(','))
            return new Set(allCategories.filter((c) => !hidden.has(c)))
        }
        return new Set(allCategories)
    })

    // Refs to track latest values for use in callbacks without stale closures
    const latestSearchRef = useRef(searchQuery)
    const latestCategoriesRef = useRef(visibleCategories)
    latestSearchRef.current = searchQuery
    latestCategoriesRef.current = visibleCategories

    const { markAsExplored, isExplored } = useExploredConcepts()

    const isLocalView = !!urlConceptId

    // Build URL search string from given state
    const buildSearch = useCallback(
        (query: string, cats: Set<string>) => {
            const params = new URLSearchParams()
            const q = query.trim()
            if (q) params.set('q', q)
            if (cats.size < allCategories.length) {
                const hidden = allCategories.filter((c) => !cats.has(c))
                if (hidden.length > 0) params.set('hide', hidden.join(','))
            }
            return params
        },
        [allCategories]
    )

    // Update only the search params portion of the URL
    const syncUrlParams = useCallback(
        (query: string, cats: Set<string>) => {
            setSearchParams(buildSearch(query, cats), { replace: true })
        },
        [buildSearch, setSearchParams]
    )

    // Build a full path string preserving search params
    const buildPath = useCallback(
        (path: string) => {
            const params = buildSearch(latestSearchRef.current, latestCategoriesRef.current)
            const str = params.toString()
            return str ? `${path}?${str}` : path
        },
        [buildSearch]
    )

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        }
    }, [])

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

    const handleNodeClick = useCallback(
        (nodeId: string) => {
            navigate(buildPath(`/explore/${nodeId}`))
        },
        [navigate, buildPath]
    )

    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHoveredNodeId(nodeId)
    }, [])

    const handleBackgroundClick = useCallback(() => {
        setSelectedConceptId(null)
    }, [])

    const handleExploreNeighbors = useCallback(
        (conceptId: string) => {
            navigate(buildPath(`/explore/${conceptId}`))
        },
        [navigate, buildPath]
    )

    const handleNavigateToConcept = useCallback(
        (conceptId: string) => {
            navigate(buildPath(`/explore/${conceptId}`))
        },
        [navigate, buildPath]
    )

    const handleToggleCategory = useCallback(
        (category: string) => {
            setVisibleCategories((prev) => {
                const next = new Set(prev)
                if (next.has(category)) {
                    next.delete(category)
                } else {
                    next.add(category)
                }
                // Clear pending search debounce and sync immediately
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                syncUrlParams(latestSearchRef.current, next)
                return next
            })
        },
        [syncUrlParams]
    )

    const handleShowAll = useCallback(() => {
        const all = new Set(allCategories)
        setVisibleCategories(all)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        syncUrlParams(latestSearchRef.current, all)
    }, [allCategories, syncUrlParams])

    const handleHideAll = useCallback(() => {
        const none = new Set<string>()
        setVisibleCategories(none)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        syncUrlParams(latestSearchRef.current, none)
    }, [syncUrlParams])

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            // Debounced URL update
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            searchDebounceRef.current = setTimeout(() => {
                syncUrlParams(query, latestCategoriesRef.current)
            }, 300)
        },
        [syncUrlParams]
    )

    const handleBackToGlobal = useCallback(() => {
        navigate(buildPath('/explore'))
    }, [navigate, buildPath])

    const selectedConcept = selectedConceptId ? conceptMap.get(selectedConceptId) || null : null

    return (
        <div className='relative w-full overflow-hidden' style={{ height: 'calc(100vh - 64px)' }}>
            {/* Back to global view button when in local view */}
            {isLocalView && (
                <button
                    onClick={handleBackToGlobal}
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
