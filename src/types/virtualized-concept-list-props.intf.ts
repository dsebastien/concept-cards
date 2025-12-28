import type { Concept } from './concept.intf'
import type { ViewMode } from './view-mode.intf'

export interface VirtualizedConceptListProps {
    concepts: Concept[]
    viewMode: ViewMode
    onShowDetails: (concept: Concept) => void
    onTagClick: (tag: string) => void
    onCategoryClick: (category: string) => void
    isExplored: (conceptId: string) => boolean
}
