#!/usr/bin/env tsx
/**
 * Populates datePublished and dateModified fields for all concept JSON files
 * using git history to determine the actual dates.
 *
 * - datePublished: Date of the first commit that added the file
 * - dateModified: Date of the most recent commit that modified the file
 *
 * For files not yet in git, uses today's date for both fields.
 */

import { execSync } from 'child_process'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const conceptsDir = join(__dirname, '../src/data/concepts')

/**
 * Get the date of the first commit for a file (creation date)
 */
function getFirstCommitDate(filePath: string): string | null {
    try {
        // Get the date of the first commit that added this file
        const result = execSync(
            `git log --diff-filter=A --follow --format=%aI -- "${filePath}" | tail -1`,
            { encoding: 'utf-8', cwd: join(__dirname, '..') }
        ).trim()

        if (result) {
            // Extract just the date part (YYYY-MM-DD)
            return result.split('T')[0]
        }
        return null
    } catch {
        return null
    }
}

/**
 * Get the date of the most recent commit for a file (last modification)
 */
function getLastCommitDate(filePath: string): string | null {
    try {
        // Get the date of the most recent commit that modified this file
        const result = execSync(`git log -1 --format=%aI -- "${filePath}"`, {
            encoding: 'utf-8',
            cwd: join(__dirname, '..')
        }).trim()

        if (result) {
            // Extract just the date part (YYYY-MM-DD)
            return result.split('T')[0]
        }
        return null
    } catch {
        return null
    }
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]
}

/**
 * Process a single concept file
 */
function processConceptFile(filename: string): { updated: boolean; message: string } {
    const filePath = join(conceptsDir, filename)
    const relativePath = `src/data/concepts/${filename}`

    try {
        const content = readFileSync(filePath, 'utf-8')
        const concept = JSON.parse(content)

        // Get dates from git history
        let datePublished = getFirstCommitDate(relativePath)
        let dateModified = getLastCommitDate(relativePath)

        // If not in git, use today's date
        const today = getTodayDate()
        if (!datePublished) {
            datePublished = today
        }
        if (!dateModified) {
            dateModified = today
        }

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
let updatedCount = 0
let skippedCount = 0
let errorCount = 0

for (const filename of conceptFiles) {
    const result = processConceptFile(filename)
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

console.log(`\n✓ Done!`)
console.log(`  - Updated: ${updatedCount}`)
console.log(`  - Skipped (already up to date): ${skippedCount}`)
if (errorCount > 0) {
    console.log(`  - Errors: ${errorCount}`)
}
