/**
 * Source of truth for the Concept domain types.
 *
 * Zod schemas defined here are used both to derive TypeScript types
 * (via `z.infer<>`) and to validate concept JSON data at runtime.
 *
 * The companion `*.intf.ts` files re-export the inferred types so
 * existing imports keep working.
 */

import { z } from 'zod'

const conceptIdRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/

export const referenceTypeSchema = z.enum(['paper', 'website', 'video', 'podcast', 'other'])
export type ReferenceType = z.infer<typeof referenceTypeSchema>

export const referenceSchema = z.object({
    title: z.string().min(1),
    url: z.string().url(),
    type: referenceTypeSchema
})
export type Reference = z.infer<typeof referenceSchema>

export const bookSchema = z.object({
    title: z.string().min(1),
    url: z.string().url()
})
export type Book = z.infer<typeof bookSchema>

const isoDateSchema = z.string().regex(isoDateRegex, 'Date must be in YYYY-MM-DD format')

export const conceptSchema = z.object({
    id: z.string().regex(conceptIdRegex, 'id must be lowercase, hyphenated'),
    name: z.string().min(1),
    summary: z.string().min(1),
    explanation: z.string().min(1),
    tags: z.array(z.string().min(1)),
    category: z.string().min(1),
    icon: z.string().optional(),
    featured: z.boolean(),
    aliases: z.array(z.string().min(1)).optional(),
    relatedConcepts: z.array(z.string().min(1)).optional(),
    relatedNotes: z.array(z.string().url()).optional(),
    articles: z.array(referenceSchema).optional(),
    books: z.array(bookSchema).optional(),
    references: z.array(referenceSchema).optional(),
    tutorials: z.array(referenceSchema).optional(),
    datePublished: isoDateSchema,
    dateModified: isoDateSchema
})
export type Concept = z.infer<typeof conceptSchema>

export interface ConceptValidationIssue {
    path: string
    message: string
}

export interface ConceptValidationResult {
    success: boolean
    data?: Concept
    issues: ConceptValidationIssue[]
}

/**
 * Validate an unknown value against the concept schema and return
 * a normalized result that callers can format however they like.
 */
export function validateConcept(input: unknown): ConceptValidationResult {
    const parsed = conceptSchema.safeParse(input)
    if (parsed.success) {
        return { success: true, data: parsed.data, issues: [] }
    }
    return {
        success: false,
        issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.') || '<root>',
            message: issue.message
        }))
    }
}
