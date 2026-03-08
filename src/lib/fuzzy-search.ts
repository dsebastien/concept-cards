/**
 * Fuzzy search utility using uFuzzy for weighted multi-field searching
 */

import uFuzzy from '@leeoniya/ufuzzy'

/**
 * Configuration for a searchable field
 */
export interface SearchFieldConfig {
    /** Weight for this field (higher = more important in ranking) */
    weight: number
}

/**
 * Configuration for fuzzy search
 */
export interface FuzzySearchConfig<TFields extends string> {
    /** Field configurations with weights */
    fields: Record<TFields, SearchFieldConfig>
}

/**
 * Result of a fuzzy search with score
 */
export interface FuzzySearchResult<T> {
    item: T
    score: number
}

/**
 * Options for the fuzzy search function
 */
export interface FuzzySearchOptions {
    /** Maximum number of results to return (default: unlimited) */
    limit?: number
}

// Create a single uFuzzy instance with lenient settings for fuzzy matching
const fuzzyMatcher = new uFuzzy({
    // Allow characters between query letters (for "obsk" -> "obsidian starter kit")
    interIns: 50,
    // Allow some character mismatches for typo tolerance
    intraMode: 1,
    // Maximum allowed extra chars between terms
    intraIns: 1,
    // Balanced matching - not too strict, not too loose
    interSplit: '[^a-zA-Z0-9]+',
    intraSplit: '[a-zA-Z][0-9]|[0-9][a-zA-Z]|[a-z][A-Z]'
})

/**
 * Check if query characters appear in order in the text (subsequence match)
 * This is a fallback for when uFuzzy doesn't match
 */
function isSubsequence(text: string, query: string): boolean {
    let queryIndex = 0
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            queryIndex++
        }
    }
    return queryIndex === query.length
}

/**
 * Calculate a basic score for a subsequence match
 */
function subsequenceScore(text: string, query: string): number {
    if (!isSubsequence(text, query)) return 0

    let score = 10 // Base score for any match
    let queryIndex = 0
    let lastMatchIndex = -1
    let consecutiveBonus = 0

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            // Bonus for consecutive matches
            if (lastMatchIndex === i - 1) {
                consecutiveBonus += 5
            }
            // Bonus for match at start
            if (i === 0 && queryIndex === 0) {
                score += 20
            }
            lastMatchIndex = i
            queryIndex++
        }
    }

    score += consecutiveBonus

    // Bonus for length ratio (prefer shorter texts)
    score += (query.length / text.length) * 20

    return score
}

/**
 * Perform fuzzy search on a collection of items across multiple weighted fields
 *
 * @param items - The items to search through
 * @param query - The search query
 * @param config - Configuration specifying fields and their weights
 * @param getFieldValue - Function to extract field value from an item
 * @param options - Optional search options (e.g., limit)
 * @returns Sorted array of matching items (best matches first)
 */
export function fuzzySearch<T, TFields extends string>(
    items: T[],
    query: string,
    config: FuzzySearchConfig<TFields>,
    getFieldValue: (item: T, field: TFields) => string | string[] | null | undefined,
    options?: FuzzySearchOptions
): T[] {
    const trimmedQuery = query.trim().toLowerCase()

    // Return empty array for empty query
    if (!trimmedQuery) {
        return []
    }

    const fields = Object.keys(config.fields) as TFields[]
    const scoredResults: FuzzySearchResult<T>[] = []

    // Process each item
    for (const item of items) {
        let bestScore = 0

        // Check each field for matches
        for (const field of fields) {
            const rawValue = getFieldValue(item, field)
            const fieldWeight = config.fields[field].weight

            // Handle array values (e.g., tags)
            const values: string[] = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []

            for (const value of values) {
                if (!value) continue

                const normalizedValue = value.toLowerCase()

                // Use uFuzzy to search
                const haystack = [normalizedValue]
                const idxs = fuzzyMatcher.filter(haystack, trimmedQuery)

                let score = 0

                if (idxs && idxs.length > 0) {
                    // Get detailed match info for scoring
                    const info = fuzzyMatcher.info(idxs, haystack, trimmedQuery)

                    if (info) {
                        const matchStart = info.start[0] ?? 0
                        const lengthRatio = trimmedQuery.length / normalizedValue.length

                        // Base score from field weight
                        score = fieldWeight * 100

                        // Bonus for matches at the start
                        if (matchStart === 0) {
                            score += 50
                        } else {
                            score -= matchStart * 2
                        }

                        // Bonus for good length match
                        score += lengthRatio * 30

                        // Exact match bonus
                        if (normalizedValue === trimmedQuery) {
                            score += 200
                        } else if (normalizedValue.includes(trimmedQuery)) {
                            // Substring match bonus
                            score += 100
                        }
                    }
                } else {
                    // Fallback: check for subsequence match
                    const subScore = subsequenceScore(normalizedValue, trimmedQuery)
                    if (subScore > 0) {
                        // Apply field weight but at lower priority than uFuzzy matches
                        score = fieldWeight * 50 + subScore
                    }
                }

                bestScore = Math.max(bestScore, score)
            }
        }

        // Only include items with a match
        if (bestScore > 0) {
            scoredResults.push({ item, score: bestScore })
        }
    }

    // Sort by score (highest first)
    scoredResults.sort((a, b) => b.score - a.score)

    // Extract items and apply limit if specified
    const sortedItems = scoredResults.map((r) => r.item)

    if (options?.limit !== undefined && options.limit > 0) {
        return sortedItems.slice(0, options.limit)
    }

    return sortedItems
}

/**
 * Simple fuzzy search on a single text field
 *
 * @param items - The items to search through
 * @param query - The search query
 * @param getText - Function to extract searchable text from an item
 * @param options - Optional search options (e.g., limit)
 * @returns Sorted array of matching items (best matches first)
 */
export function simpleFuzzySearch<T>(
    items: T[],
    query: string,
    getText: (item: T) => string,
    options?: FuzzySearchOptions
): T[] {
    return fuzzySearch(
        items,
        query,
        { fields: { text: { weight: 1 } } },
        (item) => getText(item),
        options
    )
}

/**
 * Simple fuzzy match check (returns boolean, no scoring).
 * Useful for filtering where ranking is not needed.
 */
export function fuzzyMatch(query: string, target: string): boolean {
    const lowerQuery = query.trim().toLowerCase()
    if (!lowerQuery) return true

    const haystack = [target.toLowerCase()]
    const idxs = fuzzyMatcher.filter(haystack, lowerQuery)

    if (idxs && idxs.length > 0) return true

    // Fallback: subsequence match
    return isSubsequence(target.toLowerCase(), lowerQuery)
}
