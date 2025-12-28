import type { Concept } from './concept.intf'
import type { ViewMode } from './view-mode.intf'

export interface ConceptCardProps {
    concept: Concept
    onShowDetails: (concept: Concept) => void
    onTagClick: (tag: string) => void
    onCategoryClick: (category: string) => void
    viewMode: ViewMode
    isExplored?: boolean
}
