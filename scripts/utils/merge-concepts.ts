#!/usr/bin/env bun
/**
 * Merges individual concept JSON files into a single concepts.json file.
 * This is run at build time to create the bundled concepts file.
 */

import * as fs from 'fs'
import * as path from 'path'

const CONCEPTS_DIR = path.join(process.cwd(), 'src/data/concepts')
const OUTPUT_FILE = path.join(process.cwd(), 'src/data/concepts.json')

export function mergeConceptFiles(): number {
    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))

    const concepts = files
        .map((f) => {
            const content = fs.readFileSync(path.join(CONCEPTS_DIR, f), 'utf-8')
            return JSON.parse(content)
        })
        .sort((a, b) => a.name.localeCompare(b.name))

    const output = { concepts }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 4))

    return concepts.length
}

// Run if called directly
if (import.meta.main) {
    const count = mergeConceptFiles()
    console.log(`✅ Merged ${count} concepts into concepts.json`)
}
