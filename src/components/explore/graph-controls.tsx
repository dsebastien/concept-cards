import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaEye,
    FaEyeSlash,
    FaGlobe,
    FaProjectDiagram,
    FaStar,
    FaTimes,
    FaCheckCircle
} from 'react-icons/fa'
import { CATEGORY_COLORS } from '@/lib/graph-utils'
import type { ExploredFilter } from '@/types/explored-filter.intf'

interface GraphControlsProps {
    nodeCount: number
    linkCount: number
    isLocalView: boolean
    visibleCategories: Set<string>
    allCategories: string[]
    searchQuery: string
    onSearchChange: (query: string) => void
    onToggleCategory: (category: string) => void
    onShowAll: () => void
    onHideAll: () => void
    // Tags
    selectedTags: Set<string>
    allTagsWithCounts: Map<string, number>
    onToggleTag: (tag: string) => void
    onClearTags: () => void
    // Featured
    featuredOnly: boolean
    featuredCount: number
    onToggleFeatured: () => void
    // Connection density
    minConnections: number
    onSetMinConnections: (min: number) => void
    // Explored
    exploredFilter: ExploredFilter
    exploredCount: number
    onSetExploredFilter: (filter: ExploredFilter) => void
}

const CONNECTION_PRESETS = [
    { label: 'Any', value: 0 },
    { label: '1+', value: 1 },
    { label: '3+', value: 3 },
    { label: '5+', value: 5 },
    { label: '10+', value: 10 }
]

const EXPLORED_OPTIONS: { label: string; value: ExploredFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Explored', value: 'explored' },
    { label: 'New', value: 'not-explored' }
]

const GraphControls: React.FC<GraphControlsProps> = ({
    nodeCount,
    linkCount,
    isLocalView,
    visibleCategories,
    allCategories,
    searchQuery,
    onSearchChange,
    onToggleCategory,
    onShowAll,
    onHideAll,
    selectedTags,
    allTagsWithCounts,
    onToggleTag,
    onClearTags,
    featuredOnly,
    featuredCount,
    onToggleFeatured,
    minConnections,
    onSetMinConnections,
    exploredFilter,
    exploredCount,
    onSetExploredFilter
}) => {
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)
    const [isTagsExpanded, setIsTagsExpanded] = useState(false)
    const [isConnectionsExpanded, setIsConnectionsExpanded] = useState(false)
    const [tagSearch, setTagSearch] = useState('')
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const handleSearch = useCallback(
        (value: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => {
                onSearchChange(value)
            }, 300)
        },
        [onSearchChange]
    )

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [])

    // Filter out "All" from categories for the legend
    const categories = allCategories.filter((c) => c !== 'All')

    // Sort tags: selected first, then alphabetically; filter by search
    const filteredTags = useMemo(() => {
        const lower = tagSearch.toLowerCase()
        const entries = [...allTagsWithCounts.entries()]
        const filtered = lower
            ? entries.filter(([tag]) => tag.toLowerCase().includes(lower))
            : entries
        filtered.sort((a, b) => {
            const aSelected = selectedTags.has(a[0])
            const bSelected = selectedTags.has(b[0])
            if (aSelected !== bSelected) return aSelected ? -1 : 1
            return a[0].localeCompare(b[0])
        })
        return filtered
    }, [allTagsWithCounts, tagSearch, selectedTags])

    return (
        <div
            className='border-primary/10 bg-surface/90 absolute z-10 flex w-48 flex-col rounded-xl border shadow-lg backdrop-blur-sm sm:w-72'
            style={{ top: '1rem', left: '1rem', maxHeight: 'calc(100% - 2rem)' }}
        >
            {/* Search */}
            <div className='p-3'>
                <div className='relative'>
                    <FaSearch
                        className='text-primary/40 absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2'
                        style={{ left: '0.75rem' }}
                    />
                    <input
                        type='text'
                        placeholder='Search...'
                        defaultValue={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className='border-primary/10 bg-primary/5 text-primary placeholder:text-primary/40 focus:border-secondary/50 w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none'
                    />
                </div>
            </div>

            {/* Stats bar */}
            <div className='border-primary/10 text-primary/60 flex items-center justify-between border-t px-3 py-2 text-xs'>
                <div className='flex items-center gap-2'>
                    {isLocalView ? (
                        <FaProjectDiagram className='h-3 w-3 text-purple-400' />
                    ) : (
                        <FaGlobe className='h-3 w-3 text-blue-400' />
                    )}
                    <span>{isLocalView ? 'Local' : 'Global'}</span>
                </div>
                <span>
                    {nodeCount.toLocaleString()} &middot; {linkCount.toLocaleString()}
                </span>
            </div>

            {/* Scrollable filter sections */}
            <div className='flex-1 overflow-y-auto'>
                {/* Featured toggle */}
                <button
                    onClick={onToggleFeatured}
                    className='border-primary/10 text-primary/70 hover:text-primary flex w-full cursor-pointer items-center justify-between border-t px-3 py-2 text-xs font-medium transition-colors'
                >
                    <span className='flex items-center gap-1.5'>
                        <FaStar
                            className={`h-3 w-3 ${featuredOnly ? 'text-amber-400' : 'text-primary/30'}`}
                        />
                        Featured only
                    </span>
                    <span className='flex items-center gap-2'>
                        <span className='text-primary/40'>{featuredCount}</span>
                        <span
                            className={`flex h-4 w-7 items-center rounded-full px-0.5 transition-colors ${
                                featuredOnly ? 'bg-amber-400' : 'bg-primary/20'
                            }`}
                        >
                            <span
                                className={`h-3 w-3 rounded-full bg-white shadow transition-transform ${
                                    featuredOnly ? 'translate-x-3' : 'translate-x-0'
                                }`}
                            />
                        </span>
                    </span>
                </button>

                {/* Explored filter */}
                <div className='border-primary/10 flex items-center justify-between border-t px-3 py-2'>
                    <span className='text-primary/70 flex items-center gap-1.5 text-xs font-medium'>
                        <FaCheckCircle
                            className={`h-3 w-3 ${exploredFilter !== 'all' ? 'text-emerald-400' : 'text-primary/30'}`}
                        />
                        Explored
                        <span className='text-primary/40'>{exploredCount}</span>
                    </span>
                    <div className='flex gap-0.5'>
                        {EXPLORED_OPTIONS.map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => onSetExploredFilter(value)}
                                className={`cursor-pointer rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                                    exploredFilter === value
                                        ? 'bg-secondary/20 text-secondary-text'
                                        : 'bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary/70'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category legend toggle */}
                <button
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className='border-primary/10 text-primary/70 hover:text-primary flex w-full cursor-pointer items-center justify-between border-t px-3 py-2 text-xs font-medium transition-colors'
                >
                    <span>Categories</span>
                    {isCategoriesExpanded ? (
                        <FaChevronUp className='h-3 w-3' />
                    ) : (
                        <FaChevronDown className='h-3 w-3' />
                    )}
                </button>

                {/* Category legend */}
                {isCategoriesExpanded && (
                    <div className='border-primary/10 flex flex-col border-t'>
                        <div className='flex items-center justify-end gap-2 px-3 py-1.5'>
                            <button
                                onClick={onShowAll}
                                className='text-primary/50 hover:text-primary flex cursor-pointer items-center gap-1 text-xs transition-colors'
                                title='Show all categories'
                            >
                                <FaEye className='h-3 w-3' />
                                All
                            </button>
                            <button
                                onClick={onHideAll}
                                className='text-primary/50 hover:text-primary flex cursor-pointer items-center gap-1 text-xs transition-colors'
                                title='Hide all categories'
                            >
                                <FaEyeSlash className='h-3 w-3' />
                                None
                            </button>
                        </div>
                        <div className='max-h-64 overflow-y-auto px-3 pb-3'>
                            <div className='flex flex-col gap-0.5'>
                                {categories.map((cat) => {
                                    const isVisible = visibleCategories.has(cat)
                                    const color = CATEGORY_COLORS[cat] || '#94a3b8'
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => onToggleCategory(cat)}
                                            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-left text-xs transition-colors ${
                                                isVisible
                                                    ? 'text-primary/80 hover:bg-primary/5'
                                                    : 'text-primary/30 hover:bg-primary/5'
                                            }`}
                                        >
                                            <span
                                                className='h-2.5 w-2.5 shrink-0 rounded-full'
                                                style={{
                                                    backgroundColor: isVisible
                                                        ? color
                                                        : 'transparent',
                                                    border: isVisible
                                                        ? 'none'
                                                        : `1px solid ${color}`
                                                }}
                                            />
                                            <span className='truncate'>{cat}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tags filter toggle */}
                <button
                    onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                    className='border-primary/10 text-primary/70 hover:text-primary flex w-full cursor-pointer items-center justify-between border-t px-3 py-2 text-xs font-medium transition-colors'
                >
                    <span className='flex items-center gap-1.5'>
                        Tags
                        {selectedTags.size > 0 && (
                            <span className='bg-secondary/20 text-secondary-text rounded-full px-1.5 py-0.5 text-[10px] leading-none'>
                                {selectedTags.size}
                            </span>
                        )}
                    </span>
                    {isTagsExpanded ? (
                        <FaChevronUp className='h-3 w-3' />
                    ) : (
                        <FaChevronDown className='h-3 w-3' />
                    )}
                </button>

                {/* Tags filter content */}
                {isTagsExpanded && (
                    <div className='border-primary/10 flex flex-col border-t'>
                        {/* Selected tags */}
                        {selectedTags.size > 0 && (
                            <div className='flex flex-wrap gap-1 px-3 pt-2'>
                                {[...selectedTags].map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => onToggleTag(tag)}
                                        className='bg-secondary/20 text-secondary-text hover:bg-secondary/30 flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors'
                                    >
                                        {tag}
                                        <FaTimes className='h-2 w-2' />
                                    </button>
                                ))}
                                <button
                                    onClick={onClearTags}
                                    className='text-primary/40 hover:text-primary cursor-pointer px-1 text-[11px] transition-colors'
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Tag search */}
                        <div className='px-3 pt-2'>
                            <input
                                type='text'
                                placeholder='Filter tags...'
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                                className='border-primary/10 bg-primary/5 text-primary placeholder:text-primary/40 focus:border-secondary/50 w-full rounded-md border px-2 py-1 text-xs outline-none'
                            />
                        </div>

                        {/* Tag list */}
                        <div className='max-h-48 overflow-y-auto px-3 pt-2.5 pb-3'>
                            <div className='flex flex-wrap gap-1'>
                                {filteredTags.slice(0, 100).map(([tag, count]) => {
                                    const isSelected = selectedTags.has(tag)
                                    return (
                                        <button
                                            key={tag}
                                            onClick={() => onToggleTag(tag)}
                                            className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] transition-colors ${
                                                isSelected
                                                    ? 'bg-secondary/20 text-secondary-text'
                                                    : 'bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary/70'
                                            }`}
                                        >
                                            {tag}
                                            <span className='ml-1 opacity-50'>{count}</span>
                                        </button>
                                    )
                                })}
                                {filteredTags.length > 100 && (
                                    <span className='text-primary/30 px-1 py-0.5 text-[11px]'>
                                        +{filteredTags.length - 100} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Connection density toggle */}
                <button
                    onClick={() => setIsConnectionsExpanded(!isConnectionsExpanded)}
                    className='border-primary/10 text-primary/70 hover:text-primary flex w-full cursor-pointer items-center justify-between border-t px-3 py-2 text-xs font-medium transition-colors'
                >
                    <span className='flex items-center gap-1.5'>
                        Connections
                        {minConnections > 0 && (
                            <span className='bg-secondary/20 text-secondary-text rounded-full px-1.5 py-0.5 text-[10px] leading-none'>
                                {minConnections}+
                            </span>
                        )}
                    </span>
                    {isConnectionsExpanded ? (
                        <FaChevronUp className='h-3 w-3' />
                    ) : (
                        <FaChevronDown className='h-3 w-3' />
                    )}
                </button>

                {/* Connection density content */}
                {isConnectionsExpanded && (
                    <div className='border-primary/10 border-t px-3 py-2'>
                        <div className='flex flex-wrap gap-1'>
                            {CONNECTION_PRESETS.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => onSetMinConnections(value)}
                                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                        minConnections === value
                                            ? 'bg-secondary/20 text-secondary-text'
                                            : 'bg-primary/5 text-primary/50 hover:bg-primary/10 hover:text-primary/70'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default GraphControls
