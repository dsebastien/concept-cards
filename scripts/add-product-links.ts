#!/usr/bin/env bun

import * as fs from 'fs'
import * as path from 'path'
import type { Reference } from '../src/types/concept'

interface Product {
    id: string
    title: string
    url: string
    type: string
    matchTags: string[]
}

interface ProductsConfig {
    products: Product[]
}

const CONCEPTS_DIR = path.join(__dirname, '../src/data/concepts')
const PRODUCTS_FILE = path.join(__dirname, 'products.json')

function loadProducts(): Product[] {
    const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8')
    const config: ProductsConfig = JSON.parse(content)
    return config.products
}

function hasProductLink(references: Reference[], productUrl: string): boolean {
    return references.some((ref) => ref.url.includes(productUrl) || productUrl.includes(ref.url))
}

function getMatchingProducts(tags: string[], products: Product[]): Reference[] {
    const matchedProducts: Reference[] = []
    const lowerTags = tags.map((t) => t.toLowerCase())

    for (const product of products) {
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
    filePath: string,
    products: Product[]
): Promise<{ updated: boolean; added: string[] }> {
    const content = fs.readFileSync(filePath, 'utf-8')
    const concept: Concept = JSON.parse(content)

    if (!concept.references) {
        concept.references = []
    }

    const matchingProducts = getMatchingProducts(concept.tags || [], products)
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
    const products = loadProducts()
    console.log(`Loaded ${products.length} products from products.json`)

    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))
    let totalUpdated = 0
    const updates: { file: string; products: string[] }[] = []

    console.log(`Processing ${files.length} concept files...`)

    for (const file of files) {
        const filePath = path.join(CONCEPTS_DIR, file)
        const result = await processConceptFile(filePath, products)

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
