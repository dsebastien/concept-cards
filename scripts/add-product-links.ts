#!/usr/bin/env bun

import * as fs from 'fs'
import * as path from 'path'

interface Reference {
    title: string
    url: string
    type: string
}

interface Concept {
    id: string
    name: string
    tags: string[]
    references: Reference[]
    [key: string]: unknown
}

// Product definitions with their matching tags
const PRODUCTS = {
    obsidianStarterKit: {
        title: 'Obsidian Starter Kit',
        url: 'https://store.dsebastien.net/l/obsidian-starter-kit',
        type: 'other',
        matchTags: [
            'obsidian',
            'note-taking',
            'pkm',
            'knowledge-management',
            'organization',
            'templates',
            'vault'
        ]
    },
    knowledgeManagementForBeginners: {
        title: 'Knowledge Management for Beginners',
        url: 'https://developassion.gumroad.com/l/knowledge-management-for-beginners-ebook',
        type: 'other',
        matchTags: ['pkm', 'knowledge-management', 'information-management', 'organization']
    },
    knowiiCommunity: {
        title: 'Knowii Community',
        url: 'https://store.dsebastien.net/l/knowii',
        type: 'other',
        matchTags: ['pkm', 'knowledge-management', 'learning', 'note-taking', 'productivity']
    }
}

const CONCEPTS_DIR = path.join(__dirname, '../src/data/concepts')

function hasProductLink(references: Reference[], productUrl: string): boolean {
    return references.some((ref) => ref.url.includes(productUrl) || productUrl.includes(ref.url))
}

function getMatchingProducts(tags: string[]): Reference[] {
    const matchedProducts: Reference[] = []
    const lowerTags = tags.map((t) => t.toLowerCase())

    for (const [, product] of Object.entries(PRODUCTS)) {
        const hasMatch = product.matchTags.some((matchTag) =>
            lowerTags.includes(matchTag.toLowerCase())
        )
        if (hasMatch) {
            matchedProducts.push({
                title: product.title,
                url: product.url,
                type: product.type
            })
        }
    }

    return matchedProducts
}

async function processConceptFile(
    filePath: string
): Promise<{ updated: boolean; added: string[] }> {
    const content = fs.readFileSync(filePath, 'utf-8')
    const concept: Concept = JSON.parse(content)

    if (!concept.references) {
        concept.references = []
    }

    const matchingProducts = getMatchingProducts(concept.tags || [])
    const addedProducts: string[] = []

    for (const product of matchingProducts) {
        if (!hasProductLink(concept.references, product.url)) {
            concept.references.push(product)
            addedProducts.push(product.title)
        }
    }

    if (addedProducts.length > 0) {
        fs.writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n')
        return { updated: true, added: addedProducts }
    }

    return { updated: false, added: [] }
}

async function main() {
    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))
    let totalUpdated = 0
    const updates: { file: string; products: string[] }[] = []

    console.log(`Processing ${files.length} concept files...`)

    for (const file of files) {
        const filePath = path.join(CONCEPTS_DIR, file)
        const result = await processConceptFile(filePath)

        if (result.updated) {
            totalUpdated++
            updates.push({ file, products: result.added })
        }
    }

    console.log(`\nUpdated ${totalUpdated} files:`)
    for (const update of updates) {
        console.log(`  ${update.file}: +${update.products.join(', ')}`)
    }
}

main().catch(console.error)
