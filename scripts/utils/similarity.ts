/**
 * Text similarity functions for duplicate detection
 */

import natural from 'natural'

const { LevenshteinDistance, JaroWinklerDistance, TfIdf } = natural

/**
 * Normalize text for comparison
 */
export function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
}

/**
 * Calculate Levenshtein similarity (0-1 scale)
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
    const distance = LevenshteinDistance(normalize(str1), normalize(str2))
    const maxLen = Math.max(str1.length, str2.length)
    return maxLen === 0 ? 1 : 1 - distance / maxLen
}

/**
 * Calculate Jaro-Winkler similarity
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
    return JaroWinklerDistance(normalize(str1), normalize(str2))
}

/**
 * Calculate TF-IDF cosine similarity
 */
export function tfidfSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0

    const tfidf = new TfIdf()
    tfidf.addDocument(text1)
    tfidf.addDocument(text2)

    // Get terms from both documents
    const terms = new Set<string>()
    tfidf.listTerms(0).forEach((item) => terms.add(item.term))
    tfidf.listTerms(1).forEach((item) => terms.add(item.term))

    // Calculate cosine similarity
    let dotProduct = 0
    let mag1 = 0
    let mag2 = 0

    terms.forEach((term) => {
        const tfidf1 = tfidf.tfidf(term, 0)
        const tfidf2 = tfidf.tfidf(term, 1)
        dotProduct += tfidf1 * tfidf2
        mag1 += tfidf1 * tfidf1
        mag2 += tfidf2 * tfidf2
    })

    if (mag1 === 0 || mag2 === 0) return 0
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2))
}

/**
 * Get the maximum similarity score between two strings
 * using both Levenshtein and Jaro-Winkler algorithms
 */
export function maxNameSimilarity(str1: string, str2: string): number {
    return Math.max(levenshteinSimilarity(str1, str2), jaroWinklerSimilarity(str1, str2))
}
