#!/usr/bin/env bun
/**
 * Populates datePublished and dateModified fields for all concept JSON files
 * using git history to determine the actual dates.
 *
 * - datePublished: Date of the first commit that added the file
 * - dateModified: Date of the most recent commit that modified the file
 *
 * For files not yet in git, uses today's date for both fields.
 *
 * Optimized: Fetches all git history in batch queries instead of per-file.
 */

import { execSync } from 'child_process'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const conceptsDir = join(__dirname, '../src/data/concepts')
const projectRoot = join(__dirname, '..')

interface FileDates {
    firstCommit: string | null
    lastCommit: string | null
}

/**
 * Batch fetch all git dates for concept files in minimal git commands
 */
function batchGetGitDates(files: string[]): Map<string, FileDates> {
    const result = new Map<string, FileDates>()

    // Initialize all files with null dates
    for (const file of files) {
        result.set(file, { firstCommit: null, lastCommit: null })
    }

    try {
        // Get all commits with dates and affected files in chronological order (oldest first)
        // Using %x00 as record separator and %x01 as field separator for safe parsing
        const gitLog = execSync(
            `git log --reverse --format='%x00%aI' --name-only -- 'src/data/concepts/*.json'`,
            { encoding: 'utf-8', cwd: projectRoot, maxBuffer: 50 * 1024 * 1024 }
        )

        // Parse the git log output
        // Format: \0DATE\nFILE1\nFILE2\n...\0DATE\nFILE1\n...
        const records = gitLog.split('\0').filter((r) => r.trim())

        for (const record of records) {
            const lines = record.trim().split('\n')
            if (lines.length < 2) continue

            const dateStr = lines[0].split('T')[0] // Extract YYYY-MM-DD
            const affectedFiles = lines.slice(1).filter((f) => f.endsWith('.json'))

            for (const filePath of affectedFiles) {
                const filename = filePath.split('/').pop()
                if (!filename) continue

                const existing = result.get(filename)
                if (existing) {
                    // First occurrence = first commit (since we used --reverse)
                    if (!existing.firstCommit) {
                        existing.firstCommit = dateStr
                    }
                    // Always update last commit (latest will win)
                    existing.lastCommit = dateStr
                }
            }
        }
    } catch (error) {
        console.error('Warning: Could not fetch git history:', error)
    }

    return result
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Process a single concept file with pre-fetched dates
 */
function processConceptFile(
    filename: string,
    gitDates: FileDates
): { updated: boolean; message: string } {
    const filePath = join(conceptsDir, filename)

    try {
        const content = readFileSync(filePath, 'utf-8')
        const concept = JSON.parse(content)

        // Use git dates or fall back to today
        const today = getTodayDate()
        const datePublished = gitDates.firstCommit || today
        const dateModified = gitDates.lastCommit || today

        // Check if we need to update
        const needsUpdate =
            concept.datePublished !== datePublished || concept.dateModified !== dateModified

        if (!needsUpdate && concept.datePublished && concept.dateModified) {
            return { updated: false, message: `${filename}: already up to date` }
        }

        // Update the concept with dates
        // We need to preserve the order of keys, so we'll reconstruct the object
        const updatedConcept: Record<string, unknown> = {}

        // Copy all existing properties
        for (const key of Object.keys(concept)) {
            if (key !== 'datePublished' && key !== 'dateModified') {
                updatedConcept[key] = concept[key]
            }
        }

        // Add date fields at the end
        updatedConcept.datePublished = datePublished
        updatedConcept.dateModified = dateModified

        // Write back with pretty formatting
        writeFileSync(filePath, JSON.stringify(updatedConcept, null, 4) + '\n')

        return {
            updated: true,
            message: `${filename}: published=${datePublished}, modified=${dateModified}`
        }
    } catch (error) {
        return {
            updated: false,
            message: `${filename}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
}

// Main execution
console.log('Populating concept dates from git history...\n')

const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))

// Batch fetch all git dates in a single query
console.log(`Fetching git history for ${conceptFiles.length} concept files...`)
const startTime = performance.now()
const allGitDates = batchGetGitDates(conceptFiles)
const gitFetchTime = performance.now() - startTime
console.log(`Git history fetched in ${gitFetchTime.toFixed(0)}ms\n`)

let updatedCount = 0
let skippedCount = 0
let errorCount = 0

for (const filename of conceptFiles) {
    const gitDates = allGitDates.get(filename) || { firstCommit: null, lastCommit: null }
    const result = processConceptFile(filename, gitDates)
    if (result.updated) {
        console.log(`  ✓ ${result.message}`)
        updatedCount++
    } else if (result.message.includes('ERROR')) {
        console.log(`  ✗ ${result.message}`)
        errorCount++
    } else {
        skippedCount++
    }
}

const totalTime = performance.now() - startTime
console.log(`\n✓ Done in ${totalTime.toFixed(0)}ms!`)
console.log(`  - Updated: ${updatedCount}`)
console.log(`  - Skipped (already up to date): ${skippedCount}`)
if (errorCount > 0) {
    console.log(`  - Errors: ${errorCount}`)
}
