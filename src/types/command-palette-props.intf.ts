import type { Concept } from './concept.intf'
import type { ViewMode } from './view-mode.intf'

export interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    concepts: Concept[]
    onShowDetails: (concept: Concept) => void
    onSetViewMode: (mode: ViewMode) => void
    onSetCategory: (category: string) => void
    categories: string[]
    isExplored: (conceptId: string) => boolean
}
