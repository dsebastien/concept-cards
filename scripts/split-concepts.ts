#!/usr/bin/env tsx
/**
 * Splits the monolithic concepts.json into individual concept files.
 * Each concept is saved as {concept-id}.json in src/data/concepts/
 * Categories are saved separately in src/data/categories.json
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { ConceptsData } from '../src/types/concept'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Paths
const conceptsJsonPath = join(__dirname, '../src/data/concepts.json')
const conceptsDir = join(__dirname, '../src/data/concepts')
const categoriesPath = join(__dirname, '../src/data/categories.json')

// Read source data
const conceptsData: ConceptsData = JSON.parse(readFileSync(conceptsJsonPath, 'utf-8'))

// Ensure concepts directory exists
if (!existsSync(conceptsDir)) {
    mkdirSync(conceptsDir, { recursive: true })
}

// Write categories to separate file
writeFileSync(categoriesPath, JSON.stringify(conceptsData.categories, null, 4) + '\n')
console.log(`✓ Categories saved to: ${categoriesPath}`)

// Write each concept to its own file
let count = 0
for (const concept of conceptsData.concepts) {
    const conceptPath = join(conceptsDir, `${concept.id}.json`)
    writeFileSync(conceptPath, JSON.stringify(concept, null, 4) + '\n')
    count++
}

console.log(`✓ Split ${count} concepts into individual files in: ${conceptsDir}`)
console.log(`\nYou can now safely delete src/data/concepts.json if desired.`)
