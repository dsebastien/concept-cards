import type { Reference } from './reference.intf'
import type { Book } from './book.intf'

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
    books?: Book[] // Recommended books
    references?: Reference[] // Papers, websites, etc.
    tutorials?: Reference[] // Tutorial links
    datePublished: string // ISO 8601 date (YYYY-MM-DD) when concept was first added
    dateModified: string // ISO 8601 date (YYYY-MM-DD) when concept was last updated
}
