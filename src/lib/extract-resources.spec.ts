import { describe, expect, test } from 'bun:test'
import {
    generateResourceId,
    extractNoteTitle,
    extractBooks,
    extractArticles,
    extractReferences,
    extractNotes
} from './extract-resources'
import type { Concept } from '@/types/concept.intf'
import type { Reference } from '@/types/reference.intf'
import type { Book } from '@/types/book.intf'

describe('generateResourceId', () => {
    test('generates consistent ID for same URL', () => {
        const url = 'https://example.com/resource'
        const id1 = generateResourceId(url)
        const id2 = generateResourceId(url)
        expect(id1).toBe(id2)
    })

    test('generates different IDs for different URLs', () => {
        const id1 = generateResourceId('https://example.com/resource1')
        const id2 = generateResourceId('https://example.com/resource2')
        expect(id1).not.toBe(id2)
    })

    test('generates valid base-36 string', () => {
        const id = generateResourceId('https://example.com/resource')
        expect(id).toMatch(/^[0-9a-z]+$/)
    })

    test('handles empty string', () => {
        const id = generateResourceId('')
        expect(id).toBe('0')
    })

    test('handles special characters in URL', () => {
        const id = generateResourceId('https://example.com/path?query=value&other=123#anchor')
        expect(id).toMatch(/^[0-9a-z]+$/)
    })
})

describe('extractNoteTitle', () => {
    test('extracts title from notes.dsebastien.net URL', () => {
        const url = 'https://notes.dsebastien.net/30+Areas/Knowledge+Management/Atomic+notes'
        const title = extractNoteTitle(url)
        expect(title).toBe('Atomic notes')
    })

    test('handles URL-encoded characters', () => {
        const url = 'https://notes.dsebastien.net/Some+Path/My%20Note%20Title'
        const title = extractNoteTitle(url)
        expect(title).toBe('My Note Title')
    })

    test('handles plus signs as spaces', () => {
        const url = 'https://notes.dsebastien.net/Path/Note+With+Spaces'
        const title = extractNoteTitle(url)
        expect(title).toBe('Note With Spaces')
    })

    test('returns Unknown Note for invalid URL', () => {
        const title = extractNoteTitle('not-a-valid-url')
        expect(title).toBe('not-a-valid-url')
    })

    test('handles URL with trailing slash', () => {
        const url = 'https://notes.dsebastien.net/Path/Note/'
        const title = extractNoteTitle(url)
        expect(title).toBe('Note')
    })

    test('handles URL with no path', () => {
        const url = 'https://notes.dsebastien.net/'
        const title = extractNoteTitle(url)
        expect(title).toBe('Unknown Note')
    })
})

describe('extractBooks', () => {
    const createConcept = (id: string, books?: Book[]): Concept => ({
        id,
        name: `Concept ${id}`,
        summary: 'Test summary',
        explanation: 'Test explanation',
        tags: [],
        category: 'Test',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
        books
    })

    test('extracts books from concepts', () => {
        const concepts = [
            createConcept('c1', [{ title: 'Book A', url: 'https://amazon.com/book-a' }]),
            createConcept('c2', [{ title: 'Book B', url: 'https://amazon.com/book-b' }])
        ]

        const books = extractBooks(concepts)
        expect(books).toHaveLength(2)
        expect(books[0]!.title).toBe('Book A')
        expect(books[1]!.title).toBe('Book B')
    })

    test('groups books by URL', () => {
        const sharedUrl = 'https://amazon.com/shared-book'
        const concepts = [
            createConcept('c1', [{ title: 'Shared Book', url: sharedUrl }]),
            createConcept('c2', [{ title: 'Shared Book', url: sharedUrl }])
        ]

        const books = extractBooks(concepts)
        expect(books).toHaveLength(1)
        expect(books[0]!.concepts).toHaveLength(2)
        expect(books[0]!.concepts[0]!.id).toBe('c1')
        expect(books[0]!.concepts[1]!.id).toBe('c2')
    })

    test('sorts books alphabetically by title', () => {
        const concepts = [
            createConcept('c1', [{ title: 'Zebra Book', url: 'https://amazon.com/z' }]),
            createConcept('c2', [{ title: 'Alpha Book', url: 'https://amazon.com/a' }])
        ]

        const books = extractBooks(concepts)
        expect(books[0]!.title).toBe('Alpha Book')
        expect(books[1]!.title).toBe('Zebra Book')
    })

    test('handles concepts without books', () => {
        const concepts = [createConcept('c1'), createConcept('c2')]
        const books = extractBooks(concepts)
        expect(books).toHaveLength(0)
    })

    test('generates unique IDs for books', () => {
        const concepts = [
            createConcept('c1', [
                { title: 'Book A', url: 'https://amazon.com/a' },
                { title: 'Book B', url: 'https://amazon.com/b' }
            ])
        ]

        const books = extractBooks(concepts)
        expect(books[0]!.id).not.toBe(books[1]!.id)
    })
})

describe('extractArticles', () => {
    const createConcept = (id: string, articles?: Reference[]): Concept => ({
        id,
        name: `Concept ${id}`,
        summary: 'Test summary',
        explanation: 'Test explanation',
        tags: [],
        category: 'Test',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
        articles
    })

    test('extracts articles from concepts', () => {
        const concepts = [
            createConcept('c1', [
                { title: 'Article A', url: 'https://example.com/a', type: 'website' }
            ]),
            createConcept('c2', [
                { title: 'Article B', url: 'https://example.com/b', type: 'website' }
            ])
        ]

        const articles = extractArticles(concepts)
        expect(articles).toHaveLength(2)
    })

    test('preserves article type', () => {
        const concepts = [
            createConcept('c1', [
                { title: 'Video Article', url: 'https://example.com/video', type: 'video' }
            ])
        ]

        const articles = extractArticles(concepts)
        expect(articles[0]!.type).toBe('video')
    })

    test('groups articles by URL', () => {
        const sharedUrl = 'https://example.com/shared'
        const concepts = [
            createConcept('c1', [{ title: 'Shared Article', url: sharedUrl, type: 'website' }]),
            createConcept('c2', [{ title: 'Shared Article', url: sharedUrl, type: 'website' }])
        ]

        const articles = extractArticles(concepts)
        expect(articles).toHaveLength(1)
        expect(articles[0]!.concepts).toHaveLength(2)
    })
})

describe('extractReferences', () => {
    const createConcept = (id: string, references?: Reference[]): Concept => ({
        id,
        name: `Concept ${id}`,
        summary: 'Test summary',
        explanation: 'Test explanation',
        tags: [],
        category: 'Test',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
        references
    })

    test('extracts references from concepts', () => {
        const concepts = [
            createConcept('c1', [
                { title: 'Paper A', url: 'https://arxiv.org/paper-a', type: 'paper' }
            ]),
            createConcept('c2', [
                { title: 'Paper B', url: 'https://arxiv.org/paper-b', type: 'paper' }
            ])
        ]

        const refs = extractReferences(concepts)
        expect(refs).toHaveLength(2)
    })

    test('preserves reference type', () => {
        const concepts = [
            createConcept('c1', [
                { title: 'Research Paper', url: 'https://arxiv.org/paper', type: 'paper' }
            ])
        ]

        const refs = extractReferences(concepts)
        expect(refs[0]!.type).toBe('paper')
    })
})

describe('extractNotes', () => {
    const createConcept = (id: string, relatedNotes?: string[]): Concept => ({
        id,
        name: `Concept ${id}`,
        summary: 'Test summary',
        explanation: 'Test explanation',
        tags: [],
        category: 'Test',
        featured: false,
        datePublished: '2024-01-01',
        dateModified: '2024-01-01',
        relatedNotes
    })

    test('extracts notes from concepts', () => {
        const concepts = [
            createConcept('c1', ['https://notes.dsebastien.net/Path/Note1']),
            createConcept('c2', ['https://notes.dsebastien.net/Path/Note2'])
        ]

        const notes = extractNotes(concepts)
        expect(notes).toHaveLength(2)
    })

    test('extracts title from note URL', () => {
        const concepts = [createConcept('c1', ['https://notes.dsebastien.net/Path/My+Note'])]

        const notes = extractNotes(concepts)
        expect(notes[0]!.title).toBe('My Note')
    })

    test('groups notes by URL', () => {
        const sharedUrl = 'https://notes.dsebastien.net/Path/Shared+Note'
        const concepts = [createConcept('c1', [sharedUrl]), createConcept('c2', [sharedUrl])]

        const notes = extractNotes(concepts)
        expect(notes).toHaveLength(1)
        expect(notes[0]!.concepts).toHaveLength(2)
    })

    test('handles concepts without notes', () => {
        const concepts = [createConcept('c1'), createConcept('c2')]
        const notes = extractNotes(concepts)
        expect(notes).toHaveLength(0)
    })
})
