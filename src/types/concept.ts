export interface Reference {
    title: string
    url: string
    type: 'book' | 'paper' | 'website' | 'video' | 'podcast' | 'other'
}

export interface Concept {
    id: string
    name: string
    summary: string
    explanation: string
    tags: string[]
    category: string
    icon?: string // React-icon name (e.g., "FaBrain", "FaLightbulb") or URL to an image
    featured: boolean
    aliases?: string[] // Alternative names for the concept
    relatedConcepts?: string[] // IDs of related concepts (internal links)
    relatedNotes?: string[] // Links to related notes (external)
    articles?: Reference[] // Related articles
    references?: Reference[] // Books, papers, etc.
    tutorials?: Reference[] // Tutorial links
}

export interface ConceptsData {
    concepts: Concept[]
    categories: string[]
}
