import { useRef, useCallback, useMemo, memo, useState, useEffect } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import ConceptCard from '@/components/concepts/concept-card'
import type { VirtualizedConceptListProps } from '@/types/virtualized-concept-list-props.intf'
import type { Concept } from '@/types/concept.intf'

// Grid configuration - MUST match the fixed heights in concept-card.tsx
// Card heights match: h-[192px] sm:h-[224px] md:h-[256px]
const CARD_HEIGHT_MOBILE = 192 // < 640px (240px reduced by 20%)
const CARD_HEIGHT_SMALL = 224 // 640px - 768px (280px reduced by 20%)
const CARD_HEIGHT_DESKTOP = 256 // >= 768px (320px reduced by 20%)

// Row spacing - vertical gap between rows (pb-X on grid container)
// Using consistent 32px gap across all breakpoints for simplicity
const ROW_SPACING = 32 // 2rem spacing between rows (matches pb-8)

// List mode heights
const CARD_HEIGHT_LIST_DESKTOP = 92
const CARD_HEIGHT_LIST_MOBILE = 120
const LIST_SPACING = 12 // pb-3 = 0.75rem

const OVERSCAN = 5

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
        // Row height = card height + vertical spacing between rows
        const estimateSize = useCallback(() => {
            if (viewMode === 'grid') {
                // Determine card height based on breakpoints
                let cardHeight: number
                if (containerWidth < 640) {
                    cardHeight = CARD_HEIGHT_MOBILE // 240px
                } else if (containerWidth < 768) {
                    cardHeight = CARD_HEIGHT_SMALL // 280px
                } else {
                    cardHeight = CARD_HEIGHT_DESKTOP // 320px
                }

                // Total row height = card height + spacing below
                // This MUST match the pb-8 (32px) applied to the grid container
                return cardHeight + ROW_SPACING
            }

            // List view
            const isMobile = containerWidth < 640
            return (isMobile ? CARD_HEIGHT_LIST_MOBILE : CARD_HEIGHT_LIST_DESKTOP) + LIST_SPACING
        }, [viewMode, containerWidth])

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
            <div ref={listRef} className='relative w-full' style={{ height: `${totalSize}px` }}>
                {virtualItems.map((virtualRow) => {
                    const rowIndex = virtualRow.index
                    const startIndex = rowIndex * columnCount
                    const rowConcepts = concepts.slice(startIndex, startIndex + columnCount)

                    return (
                        <div
                            key={virtualRow.key}
                            className='absolute top-0 left-0 mb-8 w-full'
                            style={{
                                height: `${virtualRow.size - ROW_SPACING}px`,
                                transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`
                            }}
                        >
                            <div
                                className='grid gap-6'
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
