/**
 * Search utilities for filtering concepts and resources.
 * Uses case-insensitive substring matching for fast, predictable results.
 */

/**
 * Options for search functions
 */
export interface FuzzySearchOptions {
    /** Maximum number of results to return (default: unlimited) */
    limit?: number
}

/**
 * Simple search on a single text field using substring matching.
 *
 * @param items - The items to search through
 * @param query - The search query
 * @param getText - Function to extract searchable text from an item
 * @param options - Optional search options (e.g., limit)
 * @returns Array of matching items (preserving original order)
 */
export function simpleFuzzySearch<T>(
    items: T[],
    query: string,
    getText: (item: T) => string,
    options?: FuzzySearchOptions
): T[] {
    const trimmedQuery = query.trim().toLowerCase()
    if (!trimmedQuery) return []

    let results = items.filter((item) => getText(item).toLowerCase().includes(trimmedQuery))

    if (options?.limit !== undefined && options.limit > 0) {
        results = results.slice(0, options.limit)
    }

    return results
}

/**
 * Simple search match check (returns boolean, no scoring).
 * Uses case-insensitive substring matching for fast, predictable filtering.
 */
export function fuzzyMatch(query: string, target: string): boolean {
    const lowerQuery = query.trim().toLowerCase()
    if (!lowerQuery) return true
    return target.toLowerCase().includes(lowerQuery)
}
