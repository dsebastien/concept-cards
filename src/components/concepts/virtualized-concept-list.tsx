import { useRef, useCallback, useMemo, memo, useState, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import ConceptCard from '@/components/concepts/concept-card'
import type { VirtualizedConceptListProps } from '@/types/virtualized-concept-list-props.intf'
import type { Concept } from '@/types/concept.intf'

// Grid configuration
const BADGE_PADDING = 16 // pt-4 = 1rem = 16px for badge overflow
const CARD_MIN_HEIGHT_GRID = 320 // Approximate card height in grid mode
const CARD_HEIGHT_LIST_DESKTOP = 92 // List card height on desktop
const CARD_HEIGHT_LIST_MOBILE = 120 // List card height on mobile (wrapped titles)
const LIST_GAP = 12 // pb-3 = 0.75rem = 12px gap between list items
const GRID_GAP = 24 // Gap between grid rows
const OVERSCAN = 5 // Number of items to render outside viewport

// Get number of columns based on container width
const getColumnCount = (containerWidth: number): number => {
    if (containerWidth >= 1536) return 7 // 2xl:grid-cols-7 (ultra-wide)
    if (containerWidth >= 1280) return 6 // xl:grid-cols-6
    if (containerWidth >= 1024) return 5 // lg:grid-cols-5
    if (containerWidth >= 768) return 4 // md:grid-cols-4
    if (containerWidth >= 640) return 3 // sm:grid-cols-3
    if (containerWidth >= 480) return 2 // Mobile landscape: 2 columns
    return 1 // Mobile portrait: 1 column for narrow viewports
}

const VirtualizedConceptList: React.FC<VirtualizedConceptListProps> = memo(
    ({ concepts, viewMode, onShowDetails, onTagClick, onCategoryClick, isExplored }) => {
        const listRef = useRef<HTMLDivElement>(null)
        // Initialize with actual window width
        const [containerWidth, setContainerWidth] = useState(() =>
            typeof window !== 'undefined' ? window.innerWidth : 1024
        )

        // Observe container resize for responsive column count
        useEffect(() => {
            const container = listRef.current
            if (!container) return

            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContainerWidth(entry.contentRect.width)
                }
            })

            resizeObserver.observe(container)
            setContainerWidth(container.offsetWidth)

            return () => resizeObserver.disconnect()
        }, [])

        // Calculate columns based on container width
        const columnCount = viewMode === 'grid' ? getColumnCount(containerWidth) : 1

        // Calculate rows for grid view
        const rowCount =
            viewMode === 'grid' ? Math.ceil(concepts.length / columnCount) : concepts.length

        // Estimate row height based on view mode and screen size
        const isMobile = containerWidth < 640
        const estimateSize = useCallback(() => {
            if (viewMode === 'grid') {
                return CARD_MIN_HEIGHT_GRID + BADGE_PADDING + GRID_GAP
            }
            // List view: larger estimate on mobile for wrapped titles
            return (isMobile ? CARD_HEIGHT_LIST_MOBILE : CARD_HEIGHT_LIST_DESKTOP) + LIST_GAP
        }, [viewMode, isMobile])

        // Use window virtualizer for single scroll context
        const virtualizer = useWindowVirtualizer({
            count: rowCount,
            estimateSize,
            overscan: OVERSCAN,
            scrollMargin: listRef.current?.offsetTop ?? 0
        })

        // Update scroll margin when list position changes
        useEffect(() => {
            if (listRef.current) {
                virtualizer.scrollRect
            }
        }, [virtualizer])

        // Remeasure when viewMode, columnCount, or containerWidth changes
        useEffect(() => {
            virtualizer.measure()
        }, [viewMode, columnCount, containerWidth, virtualizer])

        const virtualItems = virtualizer.getVirtualItems()

        // Memoize stable callbacks
        const handleShowDetails = useCallback(
            (concept: Concept) => {
                onShowDetails(concept)
            },
            [onShowDetails]
        )

        const handleTagClick = useCallback(
            (tag: string) => {
                onTagClick(tag)
            },
            [onTagClick]
        )

        const handleCategoryClick = useCallback(
            (category: string) => {
                onCategoryClick(category)
            },
            [onCategoryClick]
        )

        // Memoize isExplored check to avoid recalculating
        const exploredMap = useMemo(() => {
            const map = new Map<string, boolean>()
            concepts.forEach((c) => {
                map.set(c.id, isExplored(c.id))
            })
            return map
        }, [concepts, isExplored])

        const getIsExplored = useCallback(
            (conceptId: string) => {
                return exploredMap.get(conceptId) ?? false
            },
            [exploredMap]
        )

        if (concepts.length === 0) {
            return (
                <div className='py-16 text-center'>
                    <div className='mb-4 text-5xl'>🔍</div>
                    <h3 className='mb-2 text-xl font-semibold'>No concepts found</h3>
                    <p className='text-primary/60'>
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                </div>
            )
        }

        // Calculate total size for the container
        const totalSize = virtualizer.getTotalSize()

        if (viewMode === 'list') {
            return (
                <div ref={listRef} className='relative w-full' style={{ height: `${totalSize}px` }}>
                    {virtualItems.map((virtualRow) => {
                        const concept = concepts[virtualRow.index]
                        if (!concept) return null

                        return (
                            <div
                                key={concept.id}
                                className='absolute top-0 left-0 w-full'
                                style={{
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`
                                }}
                            >
                                <div className='pb-3'>
                                    <ConceptCard
                                        concept={concept}
                                        onShowDetails={handleShowDetails}
                                        onTagClick={handleTagClick}
                                        onCategoryClick={handleCategoryClick}
                                        viewMode='list'
                                        isExplored={getIsExplored(concept.id)}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )
        }

        // Grid view - virtualize rows, render columns within each row
        return (
            <div
                ref={listRef}
                className='relative w-full pt-3'
                style={{ height: `${totalSize}px` }}
            >
                {virtualItems.map((virtualRow) => {
                    const rowIndex = virtualRow.index
                    const startIndex = rowIndex * columnCount
                    const rowConcepts = concepts.slice(startIndex, startIndex + columnCount)

                    return (
                        <div
                            key={virtualRow.key}
                            className='absolute top-0 left-0 w-full'
                            style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`
                            }}
                        >
                            <div
                                className='grid gap-3 pb-6 sm:gap-4 lg:gap-6'
                                style={{
                                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
                                }}
                            >
                                {rowConcepts.map((concept) => (
                                    <ConceptCard
                                        key={concept.id}
                                        concept={concept}
                                        onShowDetails={handleShowDetails}
                                        onTagClick={handleTagClick}
                                        onCategoryClick={handleCategoryClick}
                                        viewMode='grid'
                                        isExplored={getIsExplored(concept.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
)

VirtualizedConceptList.displayName = 'VirtualizedConceptList'

export default VirtualizedConceptList
