#!/usr/bin/env bun
/**
 * Generates an RSS feed (feed.xml) for the concepts website.
 * Includes the most recently modified/published concepts.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { Concept } from '../src/types/concept'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://concepts.dsebastien.net'
const FEED_TITLE = 'Concepts by dSebastien'
const FEED_DESCRIPTION =
    'A curated collection of PKM concepts, methods, and principles for knowledge management and personal development.'
const FEED_LANGUAGE = 'en-us'
const FEED_AUTHOR = 'Sébastien Dubois'
const FEED_EMAIL = 'sebastien@dsebastien.net'
const MAX_ITEMS = 50 // Number of items to include in the feed

// Load all concepts from individual files
const conceptsDir = join(__dirname, '../src/data/concepts')
const conceptFiles = readdirSync(conceptsDir).filter((f) => f.endsWith('.json'))
const concepts: Concept[] = conceptFiles.map((file) => {
    const filePath = join(conceptsDir, file)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
})

// Sort concepts by dateModified (most recent first), then by datePublished
const sortedConcepts = [...concepts].sort((a, b) => {
    const dateA = new Date(a.dateModified || a.datePublished || '2000-01-01')
    const dateB = new Date(b.dateModified || b.datePublished || '2000-01-01')
    return dateB.getTime() - dateA.getTime()
})

// Take the most recent concepts
const recentConcepts = sortedConcepts.slice(0, MAX_ITEMS)

// Escape XML special characters
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

// Convert ISO date to RFC 822 format (required by RSS)
function toRfc822Date(isoDate: string): string {
    const date = new Date(isoDate)
    return date.toUTCString()
}

// Generate RSS feed XML
function generateRssFeed(): string {
    const now = new Date().toUTCString()

    const items = recentConcepts
        .map((concept) => {
            const pubDate = toRfc822Date(concept.datePublished || concept.dateModified)
            const link = `${BASE_URL}/concept/${concept.id}`
            const categories = [concept.category, ...concept.tags]
                .filter(Boolean)
                .map((cat) => `    <category>${escapeXml(cat)}</category>`)
                .join('\n')

            return `  <item>
    <title>${escapeXml(concept.name)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${escapeXml(concept.summary)}</description>
${categories}
  </item>`
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>${FEED_LANGUAGE}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <managingEditor>${FEED_EMAIL} (${FEED_AUTHOR})</managingEditor>
    <webMaster>${FEED_EMAIL} (${FEED_AUTHOR})</webMaster>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE_URL}/favicon.svg</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${BASE_URL}</link>
    </image>
${items}
  </channel>
</rss>
`
}

// Write RSS feed to dist folder
function writeRssFeed(): void {
    const distDir = join(__dirname, '../dist')

    // Create dist directory if it doesn't exist
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true })
    }

    const feedPath = join(distDir, 'feed.xml')
    const feed = generateRssFeed()

    writeFileSync(feedPath, feed)
    console.log(`✓ RSS feed generated: ${feedPath}`)
    console.log(`  - Total concepts: ${concepts.length}`)
    console.log(`  - Items in feed: ${recentConcepts.length}`)
    console.log(`  - Most recent: ${recentConcepts[0]?.name || 'N/A'}`)
}

writeRssFeed()
