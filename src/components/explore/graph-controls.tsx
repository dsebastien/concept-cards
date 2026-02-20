import { useState, useCallback, useRef, useEffect } from 'react'
import {
    FaSearch,
    FaChevronDown,
    FaChevronUp,
    FaEye,
    FaEyeSlash,
    FaGlobe,
    FaProjectDiagram
} from 'react-icons/fa'
import { CATEGORY_COLORS } from '@/lib/graph-utils'

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
}

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
    onHideAll
}) => {
    const [isExpanded, setIsExpanded] = useState(false)
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

    return (
        <div className='border-primary/10 bg-surface/90 absolute top-4 left-4 z-10 flex max-h-[calc(100%-2rem)] w-64 flex-col rounded-xl border shadow-lg backdrop-blur-sm sm:w-72'>
            {/* Search */}
            <div className='p-3'>
                <div className='relative'>
                    <FaSearch className='text-primary/40 absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2' />
                    <input
                        type='text'
                        placeholder='Search concepts...'
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
                        <FaProjectDiagram className='h-3 w-3 text-violet-400' />
                    ) : (
                        <FaGlobe className='h-3 w-3 text-blue-400' />
                    )}
                    <span>{isLocalView ? 'Local' : 'Global'}</span>
                </div>
                <span>
                    {nodeCount.toLocaleString()} nodes &middot; {linkCount.toLocaleString()} links
                </span>
            </div>

            {/* Category legend toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className='border-primary/10 text-primary/70 hover:text-primary flex cursor-pointer items-center justify-between border-t px-3 py-2 text-xs font-medium transition-colors'
            >
                <span>Categories</span>
                {isExpanded ? (
                    <FaChevronUp className='h-3 w-3' />
                ) : (
                    <FaChevronDown className='h-3 w-3' />
                )}
            </button>

            {/* Category legend - scrollable */}
            {isExpanded && (
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
                                                backgroundColor: isVisible ? color : 'transparent',
                                                border: isVisible ? 'none' : `1px solid ${color}`
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
        </div>
    )
}

export default GraphControls
