import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { concepts, categories } from '@/data/index'
import { buildGraphData, getNeighborhood, findConceptNodes } from '@/lib/graph-utils'
import { useExploredConcepts } from '@/hooks/use-explored-concepts'
import type { Concept } from '@/types/concept'
import type { ExploredFilter } from '@/types/explored-filter.intf'

import GraphCanvas, { type GraphCanvasHandle } from '@/components/explore/graph-canvas'
import GraphControls from '@/components/explore/graph-controls'
import GraphZoomControls from '@/components/explore/graph-zoom-controls'
import GraphSidePanel from '@/components/explore/graph-side-panel'
import { MetaTags, getPageSocialImage } from '@/components/layout/meta-tags'

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
    const [selectedTags, setSelectedTags] = useState<Set<string>>(() => {
        const param = searchParams.get('tags')
        return param ? new Set(param.split(',')) : new Set()
    })
    const [featuredOnly, setFeaturedOnly] = useState(() => searchParams.get('featured') === '1')
    const [minConnections, setMinConnections] = useState(() => {
        const param = searchParams.get('minDeg')
        return param ? parseInt(param, 10) || 0 : 0
    })
    const [exploredFilter, setExploredFilter] = useState<ExploredFilter>(() => {
        const param = searchParams.get('explored')
        if (param === '1') return 'explored'
        if (param === '0') return 'not-explored'
        return 'all'
    })

    // Refs to track latest values for use in callbacks without stale closures
    const latestSearchRef = useRef(searchQuery)
    const latestCategoriesRef = useRef(visibleCategories)
    const latestTagsRef = useRef(selectedTags)
    const latestFeaturedRef = useRef(featuredOnly)
    const latestMinConnectionsRef = useRef(minConnections)
    const latestExploredFilterRef = useRef(exploredFilter)
    latestSearchRef.current = searchQuery
    latestCategoriesRef.current = visibleCategories
    latestTagsRef.current = selectedTags
    latestFeaturedRef.current = featuredOnly
    latestMinConnectionsRef.current = minConnections
    latestExploredFilterRef.current = exploredFilter

    const { exploredIds, markAsExplored, isExplored, exploredCount } = useExploredConcepts()

    const isLocalView = !!urlConceptId

    // Precomputed data for filters
    const allTagsWithCounts = useMemo(() => {
        const map = new Map<string, number>()
        for (const c of concepts) {
            for (const t of (c as Concept).tags || []) map.set(t, (map.get(t) || 0) + 1)
        }
        return map
    }, [])

    const featuredCount = useMemo(() => concepts.filter((c) => (c as Concept).featured).length, [])

    // Build URL search string from given state
    const buildSearch = useCallback(
        (
            query: string,
            cats: Set<string>,
            tags: Set<string>,
            featured: boolean,
            minDeg: number,
            explored: ExploredFilter
        ) => {
            const params = new URLSearchParams()
            const q = query.trim()
            if (q) params.set('q', q)
            if (cats.size < allCategories.length) {
                const hidden = allCategories.filter((c) => !cats.has(c))
                if (hidden.length > 0) params.set('hide', hidden.join(','))
            }
            if (tags.size > 0) params.set('tags', [...tags].join(','))
            if (featured) params.set('featured', '1')
            if (minDeg > 0) params.set('minDeg', String(minDeg))
            if (explored === 'explored') params.set('explored', '1')
            else if (explored === 'not-explored') params.set('explored', '0')
            return params
        },
        [allCategories]
    )

    // Update only the search params portion of the URL
    const syncUrlParams = useCallback(
        (
            query: string,
            cats: Set<string>,
            tags: Set<string>,
            featured: boolean,
            minDeg: number,
            explored: ExploredFilter
        ) => {
            setSearchParams(buildSearch(query, cats, tags, featured, minDeg, explored), {
                replace: true
            })
        },
        [buildSearch, setSearchParams]
    )

    // Convenience to sync with latest ref values
    const syncAllParams = useCallback(() => {
        syncUrlParams(
            latestSearchRef.current,
            latestCategoriesRef.current,
            latestTagsRef.current,
            latestFeaturedRef.current,
            latestMinConnectionsRef.current,
            latestExploredFilterRef.current
        )
    }, [syncUrlParams])

    // Build a full path string preserving search params
    const buildPath = useCallback(
        (path: string) => {
            const params = buildSearch(
                latestSearchRef.current,
                latestCategoriesRef.current,
                latestTagsRef.current,
                latestFeaturedRef.current,
                latestMinConnectionsRef.current,
                latestExploredFilterRef.current
            )
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
        () =>
            buildGraphData(concepts as Concept[], {
                visibleCategories,
                selectedTags: selectedTags.size > 0 ? selectedTags : undefined,
                featuredOnly: featuredOnly || undefined,
                minConnections: minConnections || undefined,
                exploredFilter: exploredFilter !== 'all' ? exploredFilter : undefined,
                exploredIds: exploredFilter !== 'all' ? exploredIds : undefined
            }),
        [visibleCategories, selectedTags, featuredOnly, minConnections, exploredFilter, exploredIds]
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
                latestCategoriesRef.current = next
                syncAllParams()
                return next
            })
        },
        [syncAllParams]
    )

    const handleShowAll = useCallback(() => {
        const all = new Set(allCategories)
        setVisibleCategories(all)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        latestCategoriesRef.current = all
        syncAllParams()
    }, [allCategories, syncAllParams])

    const handleHideAll = useCallback(() => {
        const none = new Set<string>()
        setVisibleCategories(none)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        latestCategoriesRef.current = none
        syncAllParams()
    }, [syncAllParams])

    const handleSearchChange = useCallback(
        (query: string) => {
            setSearchQuery(query)
            latestSearchRef.current = query
            // Debounced URL update
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            searchDebounceRef.current = setTimeout(() => {
                syncAllParams()
            }, 300)
        },
        [syncAllParams]
    )

    const handleToggleTag = useCallback(
        (tag: string) => {
            setSelectedTags((prev) => {
                const next = new Set(prev)
                if (next.has(tag)) {
                    next.delete(tag)
                } else {
                    next.add(tag)
                }
                latestTagsRef.current = next
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
                syncAllParams()
                return next
            })
        },
        [syncAllParams]
    )

    const handleClearTags = useCallback(() => {
        const empty = new Set<string>()
        setSelectedTags(empty)
        latestTagsRef.current = empty
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        syncAllParams()
    }, [syncAllParams])

    const handleToggleFeatured = useCallback(() => {
        setFeaturedOnly((prev) => {
            const next = !prev
            latestFeaturedRef.current = next
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            syncAllParams()
            return next
        })
    }, [syncAllParams])

    const handleSetMinConnections = useCallback(
        (min: number) => {
            setMinConnections(min)
            latestMinConnectionsRef.current = min
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            syncAllParams()
        },
        [syncAllParams]
    )

    const handleSetExploredFilter = useCallback(
        (filter: ExploredFilter) => {
            setExploredFilter(filter)
            latestExploredFilterRef.current = filter
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
            syncAllParams()
        },
        [syncAllParams]
    )

    const handleBackToGlobal = useCallback(() => {
        navigate(buildPath('/explore'))
    }, [navigate, buildPath])

    const selectedConcept = selectedConceptId ? conceptMap.get(selectedConceptId) || null : null

    return (
        <div className='relative w-full overflow-hidden' style={{ height: 'calc(100vh - 64px)' }}>
            <MetaTags
                title='Explore Graph - Concepts'
                description='Explore the concept graph. Visualize connections between concepts, methods, and principles.'
                image={getPageSocialImage('explore')}
            />

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
                exploredIds={exploredIds}
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
                selectedTags={selectedTags}
                allTagsWithCounts={allTagsWithCounts}
                onToggleTag={handleToggleTag}
                onClearTags={handleClearTags}
                featuredOnly={featuredOnly}
                featuredCount={featuredCount}
                onToggleFeatured={handleToggleFeatured}
                minConnections={minConnections}
                onSetMinConnections={handleSetMinConnections}
                exploredFilter={exploredFilter}
                exploredCount={exploredCount}
                onSetExploredFilter={handleSetExploredFilter}
            />

            <GraphZoomControls canvasRef={canvasRef} sidePanelOpen={!!selectedConcept} />

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
