import type { Concept } from './concept.intf'

export interface ConceptDetailModalProps {
    concept: Concept | null
    allConcepts: Concept[]
    isOpen: boolean
    onClose: () => void
    onNavigateToConcept: (concept: Concept) => void
    onTagClick: (tag: string) => void
    onCategoryClick: (category: string) => void
    isExplored?: (conceptId: string) => boolean
    hidePreviousButton?: boolean
}
