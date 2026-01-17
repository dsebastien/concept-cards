import { describe, expect, test } from 'bun:test'
import {
    validateRequiredFields,
    validateRelatedConcepts,
    isValidUrl,
    validateReferenceUrls,
    validateBookUrls,
    validateRelatedNotesUrls,
    REQUIRED_FIELDS
} from './validation'
import type { Concept } from '../../src/types/concept'

const createValidConcept = (overrides?: Partial<Concept>): Concept => ({
    id: 'test-concept',
    name: 'Test Concept',
    summary: 'A test concept summary',
    explanation: 'A detailed explanation of the test concept',
    tags: ['test', 'example'],
    category: 'Test Category',
    featured: false,
    datePublished: '2024-01-01',
    dateModified: '2024-01-01',
    ...overrides
})

describe('REQUIRED_FIELDS', () => {
    test('contains all required fields', () => {
        expect(REQUIRED_FIELDS).toContain('id')
        expect(REQUIRED_FIELDS).toContain('name')
        expect(REQUIRED_FIELDS).toContain('summary')
        expect(REQUIRED_FIELDS).toContain('explanation')
        expect(REQUIRED_FIELDS).toContain('tags')
        expect(REQUIRED_FIELDS).toContain('category')
    })
})

describe('validateRequiredFields', () => {
    test('returns no issues for valid concept', () => {
        const concept = createValidConcept()
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues).toHaveLength(0)
    })

    test('returns error for missing id', () => {
        const concept = createValidConcept({ id: '' })
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'id' && i.category === 'missing-field')).toBe(true)
    })

    test('returns error for missing name', () => {
        const concept = createValidConcept({ name: '' })
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'name')).toBe(true)
    })

    test('returns error for missing summary', () => {
        const concept = createValidConcept({ summary: '' })
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'summary')).toBe(true)
    })

    test('returns error for missing explanation', () => {
        const concept = createValidConcept({ explanation: '' })
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'explanation')).toBe(true)
    })

    test('returns error for missing tags', () => {
        // Empty array is falsy in the check, this depends on implementation
        // The current implementation uses !concept[field] which treats [] as truthy
        // Let's test with undefined instead
        const concept = createValidConcept()
        // @ts-expect-error - testing undefined tags
        concept.tags = undefined
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'tags')).toBe(true)
    })

    test('returns error for missing category', () => {
        const concept = createValidConcept({ category: '' })
        const issues = validateRequiredFields('test-concept.json', concept)
        expect(issues.some((i) => i.field === 'category')).toBe(true)
    })

    test('returns warning for id/filename mismatch', () => {
        const concept = createValidConcept({ id: 'different-id' })
        const issues = validateRequiredFields('test-concept.json', concept)
        const mismatchIssue = issues.find((i) => i.category === 'id-mismatch')
        expect(mismatchIssue).toBeDefined()
        expect(mismatchIssue?.type).toBe('warning')
    })

    test('all issues include correct file reference', () => {
        const concept = createValidConcept({ name: '' })
        const issues = validateRequiredFields('my-concept.json', concept)
        issues.forEach((issue) => {
            expect(issue.file).toBe('my-concept.json')
        })
    })
})

describe('validateRelatedConcepts', () => {
    const allConceptIds = new Set(['concept-a', 'concept-b', 'concept-c'])

    test('returns no issues for valid related concepts', () => {
        const concept = createValidConcept({
            relatedConcepts: ['concept-a', 'concept-b']
        })
        const result = validateRelatedConcepts('test.json', concept, allConceptIds)
        expect(result.issues).toHaveLength(0)
        expect(result.invalidRefs).toHaveLength(0)
    })

    test('returns error for non-existent related concept', () => {
        const concept = createValidConcept({
            relatedConcepts: ['concept-a', 'nonexistent']
        })
        const result = validateRelatedConcepts('test.json', concept, allConceptIds)
        expect(result.issues).toHaveLength(1)
        expect(result.invalidRefs).toContain('nonexistent')
    })

    test('returns multiple errors for multiple invalid refs', () => {
        const concept = createValidConcept({
            relatedConcepts: ['invalid1', 'invalid2']
        })
        const result = validateRelatedConcepts('test.json', concept, allConceptIds)
        expect(result.issues).toHaveLength(2)
        expect(result.invalidRefs).toHaveLength(2)
    })

    test('handles undefined relatedConcepts', () => {
        const concept = createValidConcept()
        const result = validateRelatedConcepts('test.json', concept, allConceptIds)
        expect(result.issues).toHaveLength(0)
        expect(result.invalidRefs).toHaveLength(0)
    })

    test('handles empty relatedConcepts array', () => {
        const concept = createValidConcept({ relatedConcepts: [] })
        const result = validateRelatedConcepts('test.json', concept, allConceptIds)
        expect(result.issues).toHaveLength(0)
    })
})

describe('isValidUrl', () => {
    test('returns true for valid HTTP URL', () => {
        expect(isValidUrl('https://example.com')).toBe(true)
    })

    test('returns true for HTTP URL', () => {
        expect(isValidUrl('http://example.com')).toBe(true)
    })

    test('returns true for URL with path', () => {
        expect(isValidUrl('https://example.com/path/to/resource')).toBe(true)
    })

    test('returns true for URL with query params', () => {
        expect(isValidUrl('https://example.com?foo=bar&baz=qux')).toBe(true)
    })

    test('returns true for URL with fragment', () => {
        expect(isValidUrl('https://example.com#section')).toBe(true)
    })

    test('returns false for invalid URL', () => {
        expect(isValidUrl('not-a-url')).toBe(false)
    })

    test('returns false for empty string', () => {
        expect(isValidUrl('')).toBe(false)
    })

    test('returns false for partial URL', () => {
        expect(isValidUrl('example.com')).toBe(false)
    })
})

describe('validateReferenceUrls', () => {
    test('returns no issues for valid references', () => {
        const concept = createValidConcept({
            articles: [
                { title: 'Article 1', url: 'https://example.com/1' },
                { title: 'Article 2', url: 'https://example.com/2' }
            ]
        })
        const issues = validateReferenceUrls('test.json', concept, concept.articles, 'articles')
        expect(issues).toHaveLength(0)
    })

    test('returns error for missing URL', () => {
        const concept = createValidConcept()
        const refs = [{ title: 'No URL', url: '' }]
        const issues = validateReferenceUrls('test.json', concept, refs, 'articles')
        expect(issues).toHaveLength(1)
        expect(issues[0].category).toBe('missing-url')
    })

    test('returns error for invalid URL format', () => {
        const concept = createValidConcept()
        const refs = [{ title: 'Bad URL', url: 'not-a-url' }]
        const issues = validateReferenceUrls('test.json', concept, refs, 'articles')
        expect(issues).toHaveLength(1)
        expect(issues[0].category).toBe('invalid-url')
    })

    test('handles undefined refs', () => {
        const concept = createValidConcept()
        const issues = validateReferenceUrls('test.json', concept, undefined, 'articles')
        expect(issues).toHaveLength(0)
    })

    test('handles empty refs array', () => {
        const concept = createValidConcept()
        const issues = validateReferenceUrls('test.json', concept, [], 'articles')
        expect(issues).toHaveLength(0)
    })
})

describe('validateBookUrls', () => {
    test('returns no issues for valid books', () => {
        const concept = createValidConcept({
            books: [
                { title: 'Book 1', url: 'https://amazon.com/book1' },
                { title: 'Book 2', url: 'https://amazon.com/book2' }
            ]
        })
        const issues = validateBookUrls('test.json', concept)
        expect(issues).toHaveLength(0)
    })

    test('returns error for book with missing URL', () => {
        const concept = createValidConcept({
            books: [{ title: 'No URL Book', url: '' }]
        })
        const issues = validateBookUrls('test.json', concept)
        expect(issues).toHaveLength(1)
        expect(issues[0].category).toBe('missing-url')
    })

    test('returns error for book with invalid URL', () => {
        const concept = createValidConcept({
            books: [{ title: 'Bad URL Book', url: 'invalid' }]
        })
        const issues = validateBookUrls('test.json', concept)
        expect(issues).toHaveLength(1)
        expect(issues[0].category).toBe('invalid-url')
    })

    test('handles concept without books', () => {
        const concept = createValidConcept()
        const issues = validateBookUrls('test.json', concept)
        expect(issues).toHaveLength(0)
    })
})

describe('validateRelatedNotesUrls', () => {
    test('returns no issues for valid note URLs', () => {
        const concept = createValidConcept({
            relatedNotes: [
                'https://notes.dsebastien.net/Path/Note1',
                'https://notes.dsebastien.net/Path/Note2'
            ]
        })
        const issues = validateRelatedNotesUrls('test.json', concept)
        expect(issues).toHaveLength(0)
    })

    test('returns error for invalid note URL', () => {
        const concept = createValidConcept({
            relatedNotes: ['not-a-url']
        })
        const issues = validateRelatedNotesUrls('test.json', concept)
        expect(issues).toHaveLength(1)
        expect(issues[0].category).toBe('invalid-url')
    })

    test('handles concept without relatedNotes', () => {
        const concept = createValidConcept()
        const issues = validateRelatedNotesUrls('test.json', concept)
        expect(issues).toHaveLength(0)
    })

    test('handles empty relatedNotes array', () => {
        const concept = createValidConcept({ relatedNotes: [] })
        const issues = validateRelatedNotesUrls('test.json', concept)
        expect(issues).toHaveLength(0)
    })
})
