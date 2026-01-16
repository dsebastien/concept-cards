import { describe, expect, test } from 'bun:test'
import {
    normalize,
    levenshteinSimilarity,
    jaroWinklerSimilarity,
    tfidfSimilarity,
    maxNameSimilarity
} from './similarity'

describe('normalize', () => {
    test('converts to lowercase', () => {
        expect(normalize('HELLO')).toBe('hello')
    })

    test('trims whitespace', () => {
        expect(normalize('  hello  ')).toBe('hello')
    })

    test('removes special characters except hyphens', () => {
        expect(normalize('hello!@#$%world')).toBe('helloworld')
    })

    test('preserves hyphens', () => {
        expect(normalize('hello-world')).toBe('hello-world')
    })

    test('collapses multiple spaces', () => {
        expect(normalize('hello   world')).toBe('hello world')
    })

    test('handles mixed case and special characters', () => {
        expect(normalize('  Hello, World!  ')).toBe('hello world')
    })

    test('handles empty string', () => {
        expect(normalize('')).toBe('')
    })
})

describe('levenshteinSimilarity', () => {
    test('returns 1 for identical strings', () => {
        expect(levenshteinSimilarity('hello', 'hello')).toBe(1)
    })

    test('returns 1 for identical strings with different case', () => {
        expect(levenshteinSimilarity('Hello', 'hello')).toBe(1)
    })

    test('returns value between 0 and 1 for similar strings', () => {
        const similarity = levenshteinSimilarity('hello', 'hallo')
        expect(similarity).toBeGreaterThan(0)
        expect(similarity).toBeLessThan(1)
    })

    test('returns lower similarity for less similar strings', () => {
        const sim1 = levenshteinSimilarity('hello', 'hallo')
        const sim2 = levenshteinSimilarity('hello', 'world')
        expect(sim1).toBeGreaterThan(sim2)
    })

    test('handles empty strings', () => {
        expect(levenshteinSimilarity('', '')).toBe(1)
    })

    test('returns 0 for completely different strings of same length', () => {
        const similarity = levenshteinSimilarity('abc', 'xyz')
        expect(similarity).toBe(0)
    })
})

describe('jaroWinklerSimilarity', () => {
    test('returns 1 for identical strings', () => {
        expect(jaroWinklerSimilarity('hello', 'hello')).toBe(1)
    })

    test('returns high similarity for strings with same prefix', () => {
        const similarity = jaroWinklerSimilarity('zettelkasten', 'zettelkasting')
        expect(similarity).toBeGreaterThan(0.9)
    })

    test('returns value between 0 and 1', () => {
        const similarity = jaroWinklerSimilarity('hello', 'hallo')
        expect(similarity).toBeGreaterThan(0)
        expect(similarity).toBeLessThanOrEqual(1)
    })

    test('handles transpositions well', () => {
        const similarity = jaroWinklerSimilarity('hello', 'hlleo')
        expect(similarity).toBeGreaterThan(0.7)
    })
})

describe('tfidfSimilarity', () => {
    test('returns 1 for identical text', () => {
        const text = 'The quick brown fox jumps over the lazy dog'
        expect(tfidfSimilarity(text, text)).toBeCloseTo(1, 2)
    })

    test('returns high similarity for similar text', () => {
        const text1 = 'Machine learning is a subset of artificial intelligence'
        const text2 = 'Artificial intelligence includes machine learning'
        const similarity = tfidfSimilarity(text1, text2)
        expect(similarity).toBeGreaterThan(0.5)
    })

    test('returns low similarity for different text', () => {
        const text1 = 'Machine learning algorithms'
        const text2 = 'Cooking delicious recipes'
        const similarity = tfidfSimilarity(text1, text2)
        expect(similarity).toBeLessThan(0.3)
    })

    test('returns 0 for empty strings', () => {
        expect(tfidfSimilarity('', '')).toBe(0)
        expect(tfidfSimilarity('hello', '')).toBe(0)
        expect(tfidfSimilarity('', 'world')).toBe(0)
    })

    test('handles single-word documents', () => {
        const similarity = tfidfSimilarity('hello', 'hello')
        expect(similarity).toBeCloseTo(1, 2)
    })
})

describe('maxNameSimilarity', () => {
    test('returns the maximum of Levenshtein and Jaro-Winkler', () => {
        const str1 = 'zettelkasten'
        const str2 = 'zettelkasting'
        const max = maxNameSimilarity(str1, str2)
        const lev = levenshteinSimilarity(str1, str2)
        const jw = jaroWinklerSimilarity(str1, str2)
        expect(max).toBe(Math.max(lev, jw))
    })

    test('returns 1 for identical strings', () => {
        expect(maxNameSimilarity('test', 'test')).toBe(1)
    })

    test('returns high similarity for similar concept names', () => {
        const similarity = maxNameSimilarity('First Principles', 'First Principles Thinking')
        expect(similarity).toBeGreaterThan(0.7)
    })

    test('handles hyphenated concept names', () => {
        const similarity = maxNameSimilarity('time-boxing', 'timeboxing')
        expect(similarity).toBeGreaterThan(0.8)
    })
})
