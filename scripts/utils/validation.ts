/**
 * Concept validation utilities
 */

import type { Concept, Reference } from '../../src/types/concept'

export interface ValidationIssue {
    file: string
    conceptId: string
    type: 'error' | 'warning'
    category: string
    message: string
    field?: string
    value?: string
}

/**
 * Required fields for a concept
 */
export const REQUIRED_FIELDS = ['id', 'name', 'summary', 'explanation', 'tags', 'category']

/**
 * Validate required fields in a concept
 */
export function validateRequiredFields(file: string, concept: Concept): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    for (const field of REQUIRED_FIELDS) {
        if (!concept[field as keyof Concept]) {
            issues.push({
                file,
                conceptId: concept.id || file,
                type: 'error',
                category: 'missing-field',
                message: `Missing required field: ${field}`,
                field
            })
        }
    }

    // Check if id matches filename
    const expectedId = file.replace('.json', '')
    if (concept.id !== expectedId) {
        issues.push({
            file,
            conceptId: concept.id,
            type: 'warning',
            category: 'id-mismatch',
            message: `ID "${concept.id}" doesn't match filename "${expectedId}"`,
            field: 'id',
            value: concept.id
        })
    }

    return issues
}

/**
 * Validate relatedConcepts references
 */
export function validateRelatedConcepts(
    file: string,
    concept: Concept,
    allConceptIds: Set<string>
): { issues: ValidationIssue[]; invalidRefs: string[] } {
    const issues: ValidationIssue[] = []
    const invalidRefs: string[] = []

    if (!concept.relatedConcepts) {
        return { issues, invalidRefs }
    }

    for (const relatedId of concept.relatedConcepts) {
        if (!allConceptIds.has(relatedId)) {
            invalidRefs.push(relatedId)
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-concept',
                message: `Related concept "${relatedId}" does not exist`,
                field: 'relatedConcepts',
                value: relatedId
            })
        }
    }

    return { issues, invalidRefs }
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Validate URLs in a reference array
 */
export function validateReferenceUrls(
    file: string,
    concept: Concept,
    refs: Reference[] | undefined,
    fieldName: string
): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    if (!refs || refs.length === 0) return issues

    for (const ref of refs) {
        if (!ref.url) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-url',
                message: `${fieldName} entry "${ref.title}" has no URL`,
                field: fieldName
            })
            continue
        }

        if (!isValidUrl(ref.url)) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid URL format in ${fieldName}: ${ref.url}`,
                field: fieldName,
                value: ref.url
            })
        }
    }

    return issues
}

/**
 * Validate book URLs
 */
export function validateBookUrls(file: string, concept: Concept): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    if (!concept.books || concept.books.length === 0) return issues

    for (const book of concept.books) {
        if (!book.url) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-url',
                message: `Book "${book.title}" has no URL`,
                field: 'books'
            })
            continue
        }

        if (!isValidUrl(book.url)) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid book URL format: ${book.url}`,
                field: 'books',
                value: book.url
            })
        }
    }

    return issues
}

/**
 * Validate relatedNotes URLs
 */
export function validateRelatedNotesUrls(file: string, concept: Concept): ValidationIssue[] {
    const issues: ValidationIssue[] = []

    if (!concept.relatedNotes || concept.relatedNotes.length === 0) return issues

    for (const noteUrl of concept.relatedNotes) {
        if (!isValidUrl(noteUrl)) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid relatedNotes URL format: ${noteUrl}`,
                field: 'relatedNotes',
                value: noteUrl
            })
        }
    }

    return issues
}
