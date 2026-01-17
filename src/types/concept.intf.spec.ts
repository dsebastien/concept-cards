import { describe, expect, test } from 'bun:test'
import type { Concept } from './concept.intf'

// Type-level tests to verify Concept interface structure
describe('Concept interface', () => {
    // Valid concept factory
    const createValidConcept = (): Concept => ({
        id: 'test-concept',
        name: 'Test Concept',
        summary: 'A brief summary of the test concept',
        explanation: 'A detailed explanation of the test concept',
        tags: ['test', 'example'],
        category: 'Test Category',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-15'
    })

    describe('required fields', () => {
        test('id must be a string', () => {
            const concept = createValidConcept()
            expect(typeof concept.id).toBe('string')
        })

        test('name must be a string', () => {
            const concept = createValidConcept()
            expect(typeof concept.name).toBe('string')
        })

        test('summary must be a string', () => {
            const concept = createValidConcept()
            expect(typeof concept.summary).toBe('string')
        })

        test('explanation must be a string', () => {
            const concept = createValidConcept()
            expect(typeof concept.explanation).toBe('string')
        })

        test('tags must be an array of strings', () => {
            const concept = createValidConcept()
            expect(Array.isArray(concept.tags)).toBe(true)
            concept.tags.forEach((tag) => {
                expect(typeof tag).toBe('string')
            })
        })

        test('category must be a string', () => {
            const concept = createValidConcept()
            expect(typeof concept.category).toBe('string')
        })

        test('featured must be a boolean', () => {
            const concept = createValidConcept()
            expect(typeof concept.featured).toBe('boolean')
        })

        test('datePublished must be a string in ISO format', () => {
            const concept = createValidConcept()
            expect(typeof concept.datePublished).toBe('string')
            expect(concept.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })

        test('dateModified must be a string in ISO format', () => {
            const concept = createValidConcept()
            expect(typeof concept.dateModified).toBe('string')
            expect(concept.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })
    })

    describe('optional fields', () => {
        test('icon is optional', () => {
            const concept = createValidConcept()
            expect(concept.icon).toBeUndefined()
        })

        test('icon can be a React icon name', () => {
            const concept: Concept = {
                ...createValidConcept(),
                icon: 'FaBrain'
            }
            expect(concept.icon).toBe('FaBrain')
        })

        test('icon can be a URL', () => {
            const concept: Concept = {
                ...createValidConcept(),
                icon: 'https://example.com/icon.png'
            }
            expect(concept.icon).toBe('https://example.com/icon.png')
        })

        test('aliases is optional array of strings', () => {
            const concept: Concept = {
                ...createValidConcept(),
                aliases: ['Alternative Name', 'Another Name']
            }
            expect(Array.isArray(concept.aliases)).toBe(true)
            expect(concept.aliases).toContain('Alternative Name')
        })

        test('relatedConcepts is optional array of concept IDs', () => {
            const concept: Concept = {
                ...createValidConcept(),
                relatedConcepts: ['concept-1', 'concept-2']
            }
            expect(Array.isArray(concept.relatedConcepts)).toBe(true)
        })

        test('relatedNotes is optional array of URLs', () => {
            const concept: Concept = {
                ...createValidConcept(),
                relatedNotes: ['https://notes.dsebastien.net/Note1']
            }
            expect(Array.isArray(concept.relatedNotes)).toBe(true)
        })

        test('articles is optional array of references', () => {
            const concept: Concept = {
                ...createValidConcept(),
                articles: [{ title: 'Article', url: 'https://example.com', type: 'website' }]
            }
            expect(Array.isArray(concept.articles)).toBe(true)
            expect(concept.articles![0]!.title).toBe('Article')
        })

        test('books is optional array', () => {
            const concept: Concept = {
                ...createValidConcept(),
                books: [{ title: 'Book Title', url: 'https://amazon.com/book' }]
            }
            expect(Array.isArray(concept.books)).toBe(true)
            expect(concept.books![0]!.title).toBe('Book Title')
        })

        test('references is optional array', () => {
            const concept: Concept = {
                ...createValidConcept(),
                references: [{ title: 'Paper', url: 'https://arxiv.org/paper', type: 'paper' }]
            }
            expect(Array.isArray(concept.references)).toBe(true)
        })

        test('tutorials is optional array', () => {
            const concept: Concept = {
                ...createValidConcept(),
                tutorials: [{ title: 'Tutorial', url: 'https://youtube.com/video', type: 'video' }]
            }
            expect(Array.isArray(concept.tutorials)).toBe(true)
        })
    })

    describe('date validation', () => {
        test('datePublished follows YYYY-MM-DD format', () => {
            const concept = createValidConcept()
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            expect(dateRegex.test(concept.datePublished)).toBe(true)
        })

        test('dateModified follows YYYY-MM-DD format', () => {
            const concept = createValidConcept()
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            expect(dateRegex.test(concept.dateModified)).toBe(true)
        })

        test('dates can be parsed as valid dates', () => {
            const concept = createValidConcept()
            const publishedDate = new Date(concept.datePublished)
            const modifiedDate = new Date(concept.dateModified)
            expect(publishedDate.toString()).not.toBe('Invalid Date')
            expect(modifiedDate.toString()).not.toBe('Invalid Date')
        })
    })
})
