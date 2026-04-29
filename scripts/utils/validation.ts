/**
 * Concept validation utilities.
 *
 * Structural validation is delegated to the zod schema in
 * `src/types/concept.schema.ts` so the rules stay in one place.
 * This module wraps it with file-level context (filename, conceptId)
 * and adds cross-cutting checks (id/filename match, broken refs).
 */

import type { Concept, Reference } from '../../src/types/concept'
import { validateConcept } from '../../src/types/concept.schema'

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
 * Subset of required fields used by the legacy presence check below.
 * Comprehensive structural validation lives in `validateSchema`.
 *
 * Booleans/dates are intentionally excluded — the truthiness-based
 * check below cannot distinguish `false` from "missing".
 */
export const REQUIRED_FIELDS = ['id', 'name', 'summary', 'explanation', 'tags', 'category']

/**
 * Run structural validation against the zod schema. Each schema
 * issue is mapped to a ValidationIssue so callers can format it
 * the same way as the cross-cutting checks below.
 */
export function validateSchema(file: string, raw: unknown): ValidationIssue[] {
    const result = validateConcept(raw)
    if (result.success) return []

    const conceptId =
        raw && typeof raw === 'object' && 'id' in raw && typeof (raw as Concept).id === 'string'
            ? (raw as Concept).id
            : file

    return result.issues.map((issue) => ({
        file,
        conceptId,
        type: 'error',
        category: 'schema',
        message: `${issue.path}: ${issue.message}`,
        field: issue.path.split('.')[0]
    }))
}

/**
 * Verify the concept's id matches its filename.
 */
export function validateIdMatchesFilename(file: string, concept: Concept): ValidationIssue[] {
    const expectedId = file.replace(/\.json$/, '')
    if (concept.id === expectedId) return []
    return [
        {
            file,
            conceptId: concept.id,
            type: 'warning',
            category: 'id-mismatch',
            message: `ID "${concept.id}" doesn't match filename "${expectedId}"`,
            field: 'id',
            value: concept.id
        }
    ]
}

/**
 * Validate required fields in a concept (kept for backwards
 * compatibility — prefer `validateSchema` for new code).
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

    issues.push(...validateIdMatchesFilename(file, concept))
    return issues
}

/**
 * Validate relatedConcepts references against the known concept ids.
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

interface UrlEntry {
    url: string
    title?: string
}

/**
 * Generic URL-list validator used by the field-specific helpers.
 * Each entry's URL must be present and parsable.
 */
function validateUrlEntries(
    file: string,
    concept: Concept,
    entries: UrlEntry[] | undefined,
    fieldName: string,
    options: { describe?: (entry: UrlEntry) => string } = {}
): ValidationIssue[] {
    if (!entries || entries.length === 0) return []

    const issues: ValidationIssue[] = []
    const describe =
        options.describe ??
        ((entry: UrlEntry) => (entry.title ? `${fieldName} entry "${entry.title}"` : fieldName))

    for (const entry of entries) {
        if (!entry.url) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'missing-url',
                message: `${describe(entry)} has no URL`,
                field: fieldName
            })
            continue
        }

        if (!isValidUrl(entry.url)) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'error',
                category: 'invalid-url',
                message: `Invalid URL format in ${fieldName}: ${entry.url}`,
                field: fieldName,
                value: entry.url
            })
        }
    }

    return issues
}

/**
 * Validate URLs in a reference array (articles, references, tutorials).
 */
export function validateReferenceUrls(
    file: string,
    concept: Concept,
    refs: Reference[] | undefined,
    fieldName: string
): ValidationIssue[] {
    return validateUrlEntries(file, concept, refs, fieldName)
}

/**
 * Validate book URLs.
 */
export function validateBookUrls(file: string, concept: Concept): ValidationIssue[] {
    return validateUrlEntries(file, concept, concept.books, 'books', {
        describe: (book) => `Book "${book.title}"`
    })
}

/**
 * Validate relatedNotes URLs (plain string array).
 */
export function validateRelatedNotesUrls(file: string, concept: Concept): ValidationIssue[] {
    if (!concept.relatedNotes || concept.relatedNotes.length === 0) return []
    return validateUrlEntries(
        file,
        concept,
        concept.relatedNotes.map((url) => ({ url })),
        'relatedNotes'
    )
}
