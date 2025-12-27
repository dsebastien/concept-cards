#!/usr/bin/env tsx
/**
 * Generates static HTML pages for all routes.
 * This creates a directory structure with index.html files for each route,
 * enabling direct URL access on static hosting like GitHub Pages.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://concepts.dsebastien.net'

interface Concept {
    id: string
    tags: string[]
}

// Load all concepts from individual files
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Extract all unique tags
const allTags = Array.from(new Set(concepts.flatMap((concept) => concept.tags))).sort()

// Get all concept IDs
const allConceptIds = concepts.map((concept) => concept.id)

const distDir = join(__dirname, '../dist')

// Read the built index.html
const indexHtml = readFileSync(join(distDir, 'index.html'), 'utf-8')

/**
 * Generate customized HTML for a tag page with appropriate meta tags
 */
function generateTagPageHtml(tag: string, encodedTag: string): string {
    const tagUrl = `${BASE_URL}/tag/${encodedTag}`
    const title = `${tag} - Concepts`
    const description = `Concepts tagged with "${tag}"`

    let html = indexHtml

    // Update <title>
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)

    // Update meta description
    html = html.replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="description" content="${description}" />`
    )

    // Update Open Graph tags
    html = html.replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:title" content="${title}" />`
    )
    html = html.replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
        `<meta property="og:description" content="${description}" />`
    )

    // Update Twitter tags
    html = html.replace(
        /<meta\s+name="twitter:url"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:url" content="${tagUrl}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:title" content="${title}" />`
    )
    html = html.replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
        `<meta name="twitter:description" content="${description}" />`
    )

    return html
}

// Create directories and copy index.html for each concept
console.log('Generating static pages for concepts...')
let conceptCount = 0
for (const conceptId of allConceptIds) {
    const conceptDir = join(distDir, 'concept', conceptId)
    mkdirSync(conceptDir, { recursive: true })
    writeFileSync(join(conceptDir, 'index.html'), indexHtml)
    conceptCount++
}
console.log(`  ✓ Created ${conceptCount} concept pages`)

// Create directories and generate customized HTML for each tag
console.log('Generating static pages for tags...')
let tagCount = 0
for (const tag of allTags) {
    // URL-encode the tag for the directory name
    const encodedTag = encodeURIComponent(tag)
    const tagDir = join(distDir, 'tag', encodedTag)
    mkdirSync(tagDir, { recursive: true })

    // Generate customized HTML with tag-specific meta tags
    const tagHtml = generateTagPageHtml(tag, encodedTag)
    writeFileSync(join(tagDir, 'index.html'), tagHtml)
    tagCount++
}
console.log(`  ✓ Created ${tagCount} tag pages`)

// Create 404.html for GitHub Pages fallback (copy of index.html)
writeFileSync(join(distDir, '404.html'), indexHtml)
console.log('  ✓ Created 404.html fallback')

console.log(`\n✓ Static pages generated: ${conceptCount + tagCount + 2} total`)
console.log(`  - Homepage: 1`)
console.log(`  - Concepts: ${conceptCount}`)
console.log(`  - Tags: ${tagCount}`)
console.log(`  - 404 fallback: 1`)
