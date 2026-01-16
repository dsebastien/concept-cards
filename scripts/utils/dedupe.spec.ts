import { describe, expect, test } from 'bun:test'
import {
    dedupeStringArray,
    dedupeReferenceArray,
    dedupeBookArray,
    unique,
    uniqueObjects
} from './dedupe'

describe('dedupeStringArray', () => {
    test('returns undefined for undefined input', () => {
        expect(dedupeStringArray(undefined)).toBeUndefined()
    })

    test('returns empty array for empty input', () => {
        const result = dedupeStringArray([])
        expect(result).toEqual([])
    })

    test('returns same array if no duplicates', () => {
        const arr = ['a', 'b', 'c']
        const result = dedupeStringArray(arr)
        expect(result).toBe(arr) // Same reference
    })

    test('removes duplicate strings', () => {
        const arr = ['a', 'b', 'a', 'c', 'b']
        const result = dedupeStringArray(arr)
        expect(result).toEqual(['a', 'b', 'c'])
    })

    test('preserves order of first occurrences', () => {
        const arr = ['c', 'a', 'b', 'a', 'c']
        const result = dedupeStringArray(arr)
        expect(result).toEqual(['c', 'a', 'b'])
    })

    test('handles single element array', () => {
        const arr = ['a']
        const result = dedupeStringArray(arr)
        expect(result).toBe(arr)
    })
})

describe('dedupeReferenceArray', () => {
    test('returns undefined for undefined input', () => {
        expect(dedupeReferenceArray(undefined)).toBeUndefined()
    })

    test('returns empty array for empty input', () => {
        const result = dedupeReferenceArray([])
        expect(result).toEqual([])
    })

    test('removes duplicates by URL (case-insensitive)', () => {
        const arr = [
            { title: 'Ref 1', url: 'https://example.com/a' },
            { title: 'Ref 2', url: 'https://EXAMPLE.COM/A' },
            { title: 'Ref 3', url: 'https://example.com/b' }
        ]
        const result = dedupeReferenceArray(arr)
        expect(result).toHaveLength(2)
        expect(result![0].title).toBe('Ref 1')
        expect(result![1].title).toBe('Ref 3')
    })

    test('preserves type field', () => {
        const arr = [{ title: 'Ref', url: 'https://example.com', type: 'video' }]
        const result = dedupeReferenceArray(arr)
        expect(result![0].type).toBe('video')
    })

    test('returns same array if no duplicates', () => {
        const arr = [
            { title: 'Ref 1', url: 'https://example.com/a' },
            { title: 'Ref 2', url: 'https://example.com/b' }
        ]
        const result = dedupeReferenceArray(arr)
        expect(result).toBe(arr)
    })
})

describe('dedupeBookArray', () => {
    test('returns undefined for undefined input', () => {
        expect(dedupeBookArray(undefined)).toBeUndefined()
    })

    test('returns empty array for empty input', () => {
        const result = dedupeBookArray([])
        expect(result).toEqual([])
    })

    test('removes duplicates by URL (case-insensitive)', () => {
        const arr = [
            { title: 'Book 1', url: 'https://amazon.com/book1' },
            { title: 'Book 1 Again', url: 'https://AMAZON.COM/BOOK1' },
            { title: 'Book 2', url: 'https://amazon.com/book2' }
        ]
        const result = dedupeBookArray(arr)
        expect(result).toHaveLength(2)
        expect(result![0].title).toBe('Book 1')
        expect(result![1].title).toBe('Book 2')
    })

    test('returns same array if no duplicates', () => {
        const arr = [
            { title: 'Book 1', url: 'https://amazon.com/book1' },
            { title: 'Book 2', url: 'https://amazon.com/book2' }
        ]
        const result = dedupeBookArray(arr)
        expect(result).toBe(arr)
    })
})

describe('unique', () => {
    test('returns unique values from array', () => {
        expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })

    test('handles strings', () => {
        expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })

    test('handles empty array', () => {
        expect(unique([])).toEqual([])
    })

    test('preserves order', () => {
        expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })
})

describe('uniqueObjects', () => {
    test('removes duplicate objects by URL', () => {
        const arr = [
            { url: 'https://a.com', name: 'A' },
            { url: 'https://b.com', name: 'B' },
            { url: 'https://a.com', name: 'A duplicate' }
        ]
        const result = uniqueObjects(arr)
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe('A')
        expect(result[1].name).toBe('B')
    })

    test('handles empty array', () => {
        expect(uniqueObjects([])).toEqual([])
    })

    test('preserves all fields of unique objects', () => {
        const arr = [{ url: 'https://a.com', name: 'A', extra: 'field' }]
        const result = uniqueObjects(arr)
        expect(result[0]).toEqual({ url: 'https://a.com', name: 'A', extra: 'field' })
    })

    test('keeps first occurrence on duplicate', () => {
        const arr = [
            { url: 'https://a.com', order: 1 },
            { url: 'https://a.com', order: 2 }
        ]
        const result = uniqueObjects(arr)
        expect(result[0].order).toBe(1)
    })
})
