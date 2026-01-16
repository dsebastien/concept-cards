#!/usr/bin/env bun
/**
 * Extracts book references from the references array into a dedicated books array.
 * Books are identified by type: "book" in references.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { Concept, Book } from '../src/types/concept'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Paths
const conceptsDir = join(__dirname, '../src/data/concepts')

// Read all concept files
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))

let filesModified = 0
let totalBooksExtracted = 0

for (const file of conceptFiles) {
    const filePath = join(conceptsDir, file)
    const content = readFileSync(filePath, 'utf-8')
    const concept: Concept = JSON.parse(content)

    // Skip if no references
    if (!concept.references || concept.references.length === 0) continue

    // Find book references
    const bookRefs = concept.references.filter((r) => r.type === 'book')
    if (bookRefs.length === 0) continue

    // Extract books (without the type field)
    const books: Book[] = bookRefs.map((r) => ({
        title: r.title,
        url: r.url
    }))

    // Remove books from references
    const nonBookRefs = concept.references.filter((r) => r.type !== 'book')

    // Update concept
    concept.books = [...(concept.books || []), ...books]
    concept.references = nonBookRefs

    // Deduplicate books by URL
    const seenUrls = new Set<string>()
    concept.books = concept.books.filter((b) => {
        if (seenUrls.has(b.url)) return false
        seenUrls.add(b.url)
        return true
    })

    // Rebuild the object with correct field order
    const orderedConcept: Concept = {
        id: concept.id,
        name: concept.name,
        summary: concept.summary,
        explanation: concept.explanation,
        tags: concept.tags,
        category: concept.category,
        icon: concept.icon,
        featured: concept.featured,
        aliases: concept.aliases,
        relatedConcepts: concept.relatedConcepts,
        relatedNotes: concept.relatedNotes,
        articles: concept.articles,
        books: concept.books,
        references: concept.references,
        tutorials: concept.tutorials
    }

    // Remove undefined fields
    Object.keys(orderedConcept).forEach((key) => {
        if (orderedConcept[key as keyof Concept] === undefined) {
            delete orderedConcept[key as keyof Concept]
        }
    })

    writeFileSync(filePath, JSON.stringify(orderedConcept, null, 4) + '\n')
    filesModified++
    totalBooksExtracted += books.length
    console.log(`  ${file}: extracted ${books.length} book(s)`)
}

console.log('\n' + '='.repeat(50))
console.log('Summary:')
console.log(`  Files modified: ${filesModified}`)
console.log(`  Total books extracted: ${totalBooksExtracted}`)
