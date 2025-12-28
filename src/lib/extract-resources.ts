import type { Concept } from '@/types/concept.intf'
import type { ExtractedResource } from '@/types/extracted-resource.intf'

/**
 * Generate a stable, URL-safe ID from a URL string
 */
export function generateResourceId(url: string): string {
    let hash = 0
    for (let i = 0; i < url.length; i++) {
        const char = url.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
}

/**
 * Extract title from a notes.dsebastien.net URL
 * Converts URL-encoded path to readable title
 * e.g., "https://notes.dsebastien.net/30+Areas/.../Atomic+notes" → "Atomic notes"
 */
export function extractNoteTitle(url: string): string {
    try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/').filter(Boolean)
        const lastPart = pathParts[pathParts.length - 1] || 'Unknown Note'
        // Replace + with spaces and decode URI components
        return decodeURIComponent(lastPart.replace(/\+/g, ' '))
    } catch {
        // Fallback if URL parsing fails
        const parts = url.split('/').filter(Boolean)
        const lastPart = parts[parts.length - 1] || 'Unknown Note'
        return lastPart.replace(/\+/g, ' ')
    }
}

/**
 * Extract all unique books from concepts, grouped by URL
 */
export function extractBooks(concepts: Concept[]): ExtractedResource[] {
    const bookMap = new Map<string, ExtractedResource>()

    for (const concept of concepts) {
        if (!concept.books) continue

        for (const book of concept.books) {
            const existing = bookMap.get(book.url)
            if (existing) {
                existing.concepts.push(concept)
            } else {
                bookMap.set(book.url, {
                    id: generateResourceId(book.url),
                    title: book.title,
                    url: book.url,
                    concepts: [concept]
                })
            }
        }
    }

    return Array.from(bookMap.values()).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Extract all unique articles from concepts, grouped by URL
 */
export function extractArticles(concepts: Concept[]): ExtractedResource[] {
    const articleMap = new Map<string, ExtractedResource>()

    for (const concept of concepts) {
        if (!concept.articles) continue

        for (const article of concept.articles) {
            const existing = articleMap.get(article.url)
            if (existing) {
                existing.concepts.push(concept)
            } else {
                articleMap.set(article.url, {
                    id: generateResourceId(article.url),
                    title: article.title,
                    url: article.url,
                    type: article.type,
                    concepts: [concept]
                })
            }
        }
    }

    return Array.from(articleMap.values()).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Extract all unique references from concepts, grouped by URL
 */
export function extractReferences(concepts: Concept[]): ExtractedResource[] {
    const referenceMap = new Map<string, ExtractedResource>()

    for (const concept of concepts) {
        if (!concept.references) continue

        for (const reference of concept.references) {
            const existing = referenceMap.get(reference.url)
            if (existing) {
                existing.concepts.push(concept)
            } else {
                referenceMap.set(reference.url, {
                    id: generateResourceId(reference.url),
                    title: reference.title,
                    url: reference.url,
                    type: reference.type,
                    concepts: [concept]
                })
            }
        }
    }

    return Array.from(referenceMap.values()).sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * Extract all unique notes from concepts' relatedNotes, grouped by URL
 */
export function extractNotes(concepts: Concept[]): ExtractedResource[] {
    const noteMap = new Map<string, ExtractedResource>()

    for (const concept of concepts) {
        if (!concept.relatedNotes) continue

        for (const noteUrl of concept.relatedNotes) {
            const existing = noteMap.get(noteUrl)
            if (existing) {
                existing.concepts.push(concept)
            } else {
                noteMap.set(noteUrl, {
                    id: generateResourceId(noteUrl),
                    title: extractNoteTitle(noteUrl),
                    url: noteUrl,
                    concepts: [concept]
                })
            }
        }
    }

    return Array.from(noteMap.values()).sort((a, b) => a.title.localeCompare(b.title))
}
