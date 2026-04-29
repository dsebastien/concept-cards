#!/usr/bin/env bun
/**
 * Validates concept JSON files for:
 * - Schema conformance (zod) — required fields, formats, types
 * - Missing relatedConcepts (referenced concepts that don't exist)
 * - Broken URLs (404s) in references, articles, tutorials, relatedNotes
 *
 * Usage:
 *   bun ./scripts/validate-concepts.ts [options]
 *
 * Options:
 *   --skip-urls      Skip URL liveness checks (faster, offline mode)
 *   --fix-relations  Remove invalid relatedConcepts references
 *   --verbose        Show all checks, not just issues
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { Concept } from '../src/types/concept'
import {
    validateSchema,
    validateIdMatchesFilename,
    validateRelatedConcepts,
    validateReferenceUrls,
    validateBookUrls,
    validateRelatedNotesUrls,
    type ValidationIssue
} from './utils/validation'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Parse CLI args
const args = process.argv.slice(2)
const skipUrls = args.includes('--skip-urls')
const fixRelations = args.includes('--fix-relations')
const verbose = args.includes('--verbose')

const conceptsDir = join(__dirname, '../src/data/concepts')

const URL_FETCH_TIMEOUT_MS = 10_000
const URL_FETCH_DELAY_MS = 100
const FETCH_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; ConceptValidator/1.0)'
}

interface UrlCheckResult {
    ok: boolean
    status?: number
    error?: string
}

/**
 * Probe a URL with HEAD, falling back to GET when the server rejects HEAD.
 * Returns ok=true on any 2xx/3xx (we follow redirects).
 */
async function checkUrl(url: string): Promise<UrlCheckResult> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS)

    try {
        let response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: FETCH_HEADERS,
            redirect: 'follow'
        })

        if (response.status === 405) {
            response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: FETCH_HEADERS,
                redirect: 'follow'
            })
        }

        return { ok: response.ok, status: response.status }
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') return { ok: false, error: 'Timeout' }
            return { ok: false, error: error.message }
        }
        return { ok: false, error: 'Unknown error' }
    } finally {
        clearTimeout(timeout)
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Probe each URL in a list and emit a `broken-url` warning per failure.
 * The list of URLs comes from a single field (e.g. "articles", "books").
 */
async function checkUrlLiveness(
    file: string,
    concept: Concept,
    urls: string[],
    fieldName: string
): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = []
    for (const url of urls) {
        const result = await checkUrl(url)
        if (!result.ok) {
            issues.push({
                file,
                conceptId: concept.id,
                type: 'warning',
                category: 'broken-url',
                message: `Broken URL in ${fieldName}: ${url} (${result.status || result.error})`,
                field: fieldName,
                value: url
            })
        } else if (verbose) {
            console.log(`  ✓ ${url}`)
        }
        await sleep(URL_FETCH_DELAY_MS)
    }
    return issues
}

function fixInvalidRelations(file: string, concept: Concept, invalidRefs: string[]): boolean {
    if (invalidRefs.length === 0) return false
    const filePath = join(conceptsDir, file)
    concept.relatedConcepts = concept.relatedConcepts?.filter((id) => !invalidRefs.includes(id))
    writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n')
    return true
}

interface LoadedConcept {
    file: string
    concept: Concept
}

function loadConcepts(): { loaded: LoadedConcept[]; ids: Set<string>; issues: ValidationIssue[] } {
    const loaded: LoadedConcept[] = []
    const ids = new Set<string>()
    const issues: ValidationIssue[] = []

    const files = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))

    for (const file of files) {
        const filePath = join(conceptsDir, file)
        const raw = JSON.parse(readFileSync(filePath, 'utf-8')) as unknown

        const schemaIssues = validateSchema(file, raw)
        if (schemaIssues.length > 0) {
            issues.push(...schemaIssues)
            // Even when validation fails we still want to track the id
            // for relatedConcepts checks, so push if shape is roughly right.
            const maybe = raw as Partial<Concept>
            if (typeof maybe?.id === 'string') ids.add(maybe.id)
            continue
        }

        const concept = raw as Concept
        ids.add(concept.id)
        loaded.push({ file, concept })
    }

    return { loaded, ids, issues }
}

const fields = ['articles', 'references', 'tutorials'] as const

async function main() {
    console.log('Validation options:')
    console.log(`  Skip URL checks: ${skipUrls}`)
    console.log(`  Fix invalid relations: ${fixRelations}`)
    console.log(`  Verbose: ${verbose}`)
    console.log('')

    const { loaded, ids: allConceptIds, issues } = loadConcepts()
    console.log(`Loaded ${loaded.length} concepts\n`)

    let filesFixed = 0
    let urlsCheckedConcepts = 0

    for (const { file, concept } of loaded) {
        if (verbose) console.log(`Checking ${file}...`)

        issues.push(...validateIdMatchesFilename(file, concept))

        const refResult = validateRelatedConcepts(file, concept, allConceptIds)
        issues.push(...refResult.issues)

        if (fixRelations && refResult.invalidRefs.length > 0) {
            if (fixInvalidRelations(file, concept, refResult.invalidRefs)) {
                filesFixed++
                console.log(
                    `  Fixed ${file}: removed ${refResult.invalidRefs.length} invalid relation(s)`
                )
            }
        }

        // URL format checks (always run — they're cheap)
        for (const fieldName of fields) {
            issues.push(...validateReferenceUrls(file, concept, concept[fieldName], fieldName))
        }
        issues.push(...validateBookUrls(file, concept))
        issues.push(...validateRelatedNotesUrls(file, concept))

        // URL liveness checks (slow, optional)
        if (!skipUrls) {
            for (const fieldName of fields) {
                const urls = (concept[fieldName] ?? []).map((r) => r.url).filter(Boolean)
                issues.push(...(await checkUrlLiveness(file, concept, urls, fieldName)))
            }
            const bookUrls = (concept.books ?? []).map((b) => b.url).filter(Boolean)
            issues.push(...(await checkUrlLiveness(file, concept, bookUrls, 'books')))
            issues.push(
                ...(await checkUrlLiveness(
                    file,
                    concept,
                    concept.relatedNotes ?? [],
                    'relatedNotes'
                ))
            )
            urlsCheckedConcepts++
        }
    }

    // Report results
    console.log('\n' + '='.repeat(60))
    console.log('VALIDATION REPORT')
    console.log('='.repeat(60))

    if (issues.length === 0) {
        console.log('\n✅ No issues found!')
    } else {
        const byCategory = new Map<string, ValidationIssue[]>()
        for (const issue of issues) {
            const list = byCategory.get(issue.category) ?? []
            list.push(issue)
            byCategory.set(issue.category, list)
        }

        for (const [category, categoryIssues] of byCategory) {
            console.log(`\n### ${category.toUpperCase()} (${categoryIssues.length})`)
            for (const issue of categoryIssues) {
                const icon = issue.type === 'error' ? '❌' : '⚠️'
                console.log(`  ${icon} ${issue.file}: ${issue.message}`)
            }
        }

        const errors = issues.filter((i) => i.type === 'error').length
        const warnings = issues.filter((i) => i.type === 'warning').length
        console.log('\n' + '-'.repeat(60))
        console.log(`Summary: ${errors} error(s), ${warnings} warning(s)`)
    }

    if (fixRelations && filesFixed > 0) {
        console.log(`\nFixed ${filesFixed} file(s)`)
    }

    if (!skipUrls) {
        console.log(`\nChecked URLs in ${urlsCheckedConcepts} concept(s)`)
    }

    process.exit(issues.some((i) => i.type === 'error') ? 1 : 0)
}

main().catch((error) => {
    console.error(error)
    process.exit(1)
})
