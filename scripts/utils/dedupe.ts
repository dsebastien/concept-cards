/**
 * Deduplication utilities for concept data
 */

import type { Reference, Book } from '../../src/types/concept'

/**
 * Deduplicate simple string arrays
 */
export function dedupeStringArray(arr: string[] | undefined): string[] | undefined {
    if (!arr || arr.length === 0) return arr
    const unique = [...new Set(arr)]
    return unique.length === arr.length ? arr : unique
}

/**
 * Deduplicate reference arrays by URL (case-insensitive)
 */
export function dedupeReferenceArray(arr: Reference[] | undefined): Reference[] | undefined {
    if (!arr || arr.length === 0) return arr
    const seen = new Set<string>()
    const unique: Reference[] = []
    for (const ref of arr) {
        const key = ref.url.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(ref)
        }
    }
    return unique.length === arr.length ? arr : unique
}

/**
 * Deduplicate book arrays by URL (case-insensitive)
 */
export function dedupeBookArray(arr: Book[] | undefined): Book[] | undefined {
    if (!arr || arr.length === 0) return arr
    const seen = new Set<string>()
    const unique: Book[] = []
    for (const book of arr) {
        const key = book.url.toLowerCase()
        if (!seen.has(key)) {
            seen.add(key)
            unique.push(book)
        }
    }
    return unique.length === arr.length ? arr : unique
}

/**
 * Generic unique function for arrays
 */
export function unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
}

/**
 * Unique objects by URL property
 */
export function uniqueObjects<T extends { url: string }>(arr: T[]): T[] {
    const seen = new Set<string>()
    return arr.filter((item) => {
        if (seen.has(item.url)) return false
        seen.add(item.url)
        return true
    })
}
