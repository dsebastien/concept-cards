import type { ExploredFilter } from './explored-filter.intf'
import type { ViewMode } from './view-mode.intf'

export interface ConceptsFilterProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    selectedCategory: string
    onCategoryChange: (category: string) => void
    selectedTags: string[]
    onTagsChange: (tags: string[]) => void
    viewMode: ViewMode
    onViewModeChange: (mode: ViewMode) => void
    exploredFilter: ExploredFilter
    onExploredFilterChange: (filter: ExploredFilter) => void
    exploredCount: number
    onClearExplored: () => void
    categories: string[]
    allTags: string[]
    onOpenCommandPalette: () => void
}
