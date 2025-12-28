import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa'
import { cn } from '@/lib/utils'

const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'paper', label: 'Paper' },
    { value: 'website', label: 'Website' },
    { value: 'video', label: 'Video' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'other', label: 'Other' }
]

interface ResourceFilterProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedType?: string
    onTypeChange?: (type: string) => void
    showTypeFilter?: boolean
    placeholder?: string
}

const ResourceFilter: React.FC<ResourceFilterProps> = ({
    searchQuery,
    onSearchChange,
    selectedType = 'all',
    onTypeChange,
    showTypeFilter = false,
    placeholder = 'Search...'
}) => {
    const hasActiveFilters = searchQuery || (showTypeFilter && selectedType !== 'all')

    return (
        <div className='space-y-4'>
            {/* Search Input */}
            <div className='flex flex-col gap-3 sm:flex-row'>
                <div className='relative flex-1'>
                    <FaSearch className='text-primary/40 absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2' />
                    <input
                        type='text'
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className='bg-background/50 border-primary/10 focus:border-secondary/50 focus:ring-secondary/20 w-full rounded-xl border py-3 pr-12 pl-11 transition-colors focus:ring-2 focus:outline-none'
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className='text-primary/40 hover:text-primary absolute top-1/2 right-4 -translate-y-1/2 p-1'
                            aria-label='Clear search'
                        >
                            <FaTimes className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>

            {/* Type Filter (for articles and references) */}
            {showTypeFilter && onTypeChange && (
                <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-primary/60 flex items-center gap-2 text-sm'>
                        <FaFilter className='h-3 w-3' />
                        Type:
                    </span>
                    {typeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onTypeChange(option.value)}
                            className={cn(
                                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                                selectedType === option.value
                                    ? 'bg-secondary text-white'
                                    : 'bg-primary/5 text-primary/70 hover:bg-primary/10'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={() => {
                        onSearchChange('')
                        if (onTypeChange) onTypeChange('all')
                    }}
                    className='text-secondary hover:text-secondary/80 flex items-center gap-2 text-sm transition-colors'
                >
                    <FaTimes className='h-3 w-3' />
                    Clear filters
                </button>
            )}
        </div>
    )
}

export default ResourceFilter
