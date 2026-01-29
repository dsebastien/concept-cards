#!/usr/bin/env bun

/**
 * Interactive CLI tool to manage product tags in products.json
 *
 * Features:
 * - List all products
 * - Add/remove tags for each product
 * - Efficiently loads all existing tags at startup
 *
 * Usage:
 *   bun run update:products
 *   bun scripts/update-products.ts
 *
 * Navigation:
 *   - Up/Down: Navigate items
 *   - Space: Toggle tag on/off
 *   - Enter: Confirm selection
 *   - Escape: Go back to product list
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PRODUCTS_FILE = resolve(__dirname, 'products.json')

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
}

interface Product {
    id: string
    title: string
    url: string
    type: string
    matchTags: string[]
}

interface ProductsData {
    products: Product[]
}

// Display functions
function showBanner(): void {
    console.clear()
    console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              🏷️  PRODUCT TAGS MANAGER  🏷️                 ║
║                                                           ║
║         Add and remove tags for products easily           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
`)
}

function showSuccess(message: string): void {
    console.log(`\n${colors.bright}${colors.green}✅ ${message}${colors.reset}`)
}

function showError(message: string): void {
    console.error(`\n${colors.bright}${colors.red}❌ ${message}${colors.reset}`)
}

function showInfo(message: string): void {
    console.log(`${colors.cyan}ℹ ${message}${colors.reset}`)
}

function showGoodbye(): void {
    console.log(
        `\n${colors.bright}${colors.cyan}Thanks for using Product Tags Manager! 👋${colors.reset}\n`
    )
}

// Load products from JSON file
function loadProducts(): ProductsData {
    if (!existsSync(PRODUCTS_FILE)) {
        showError(`Products file not found: ${PRODUCTS_FILE}`)
        process.exit(1)
    }

    try {
        const content = readFileSync(PRODUCTS_FILE, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        showError('Failed to parse products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Save products to JSON file
function saveProducts(data: ProductsData): void {
    try {
        const jsonContent = JSON.stringify(data, null, 4)
        writeFileSync(PRODUCTS_FILE, jsonContent, 'utf-8')
    } catch (error) {
        showError('Failed to write products.json')
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
    }
}

// Extract all unique tags from all products
function getAllTags(products: Product[]): string[] {
    const tagSet = new Set<string>()
    for (const product of products) {
        for (const tag of product.matchTags) {
            tagSet.add(tag)
        }
    }
    return Array.from(tagSet).sort()
}

// Main product selection screen
async function selectProduct(products: Product[]): Promise<Product | null> {
    const choices = [
        ...products.map((p) => ({
            name: `${p.title} ${colors.dim}(${p.matchTags.length} tags)${colors.reset}`,
            value: p.id
        })),
        new inquirer.Separator(),
        {
            name: `${colors.yellow}➕ Add new tag to all products${colors.reset}`,
            value: '__add_new_tag__'
        },
        {
            name: `${colors.red}🗑️ Remove tag from all products${colors.reset}`,
            value: '__remove_tag__'
        },
        new inquirer.Separator(),
        { name: '👋 Exit', value: '__exit__' }
    ]

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'productId',
            message: 'Select a product to manage tags:',
            choices,
            pageSize: 20
        }
    ])

    if (answer.productId === '__exit__') {
        return null
    }

    if (answer.productId === '__add_new_tag__') {
        await addNewTagToAllProducts(products)
        return { id: '__continue__' } as Product
    }

    if (answer.productId === '__remove_tag__') {
        await removeTagFromAllProducts(products)
        return { id: '__continue__' } as Product
    }

    return products.find((p) => p.id === answer.productId) || null
}

// Add a new tag to all products that match a filter
async function addNewTagToAllProducts(products: Product[]): Promise<void> {
    const tagAnswer = await inquirer.prompt([
        {
            type: 'input',
            name: 'newTag',
            message: 'Enter the new tag name:',
            validate: (input: string) => {
                if (!input.trim()) return 'Tag name is required'
                if (!/^[a-z0-9-]+$/.test(input.trim())) {
                    return 'Tag should be lowercase with hyphens only (e.g., my-tag)'
                }
                return true
            }
        }
    ])

    const newTag = tagAnswer.newTag.trim()

    // Let user select which products to add the tag to
    const choices = products.map((p) => ({
        name: `${p.title} ${p.matchTags.includes(newTag) ? colors.dim + '(already has tag)' + colors.reset : ''}`,
        value: p.id,
        checked: false,
        disabled: p.matchTags.includes(newTag) ? 'Already has this tag' : false
    }))

    const selectAnswer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'productIds',
            message: `Select products to add "${newTag}" to:`,
            choices,
            pageSize: 20
        }
    ])

    const selectedIds = selectAnswer.productIds as string[]

    if (selectedIds.length === 0) {
        showInfo('No products selected')
        return
    }

    // Add tag to selected products
    let addedCount = 0
    for (const product of products) {
        if (selectedIds.includes(product.id) && !product.matchTags.includes(newTag)) {
            product.matchTags.push(newTag)
            product.matchTags.sort()
            addedCount++
        }
    }

    showSuccess(`Added "${newTag}" to ${addedCount} product(s)`)
}

// Remove a tag from all products
async function removeTagFromAllProducts(products: Product[]): Promise<void> {
    const allTags = getAllTags(products)

    if (allTags.length === 0) {
        showInfo('No tags found in any product')
        return
    }

    // Count how many products have each tag
    const tagCounts = new Map<string, number>()
    for (const tag of allTags) {
        tagCounts.set(tag, products.filter((p) => p.matchTags.includes(tag)).length)
    }

    const choices = allTags.map((tag) => ({
        name: `${tag} ${colors.dim}(${tagCounts.get(tag)} products)${colors.reset}`,
        value: tag
    }))

    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'tag',
            message: 'Select tag to remove from all products:',
            choices,
            pageSize: 20
        }
    ])

    const tagToRemove = answer.tag

    // Confirm removal
    const confirmAnswer = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Remove "${tagToRemove}" from all ${tagCounts.get(tagToRemove)} products?`,
            default: false
        }
    ])

    if (!confirmAnswer.confirm) {
        showInfo('Operation cancelled')
        return
    }

    // Remove tag from all products
    let removedCount = 0
    for (const product of products) {
        const index = product.matchTags.indexOf(tagToRemove)
        if (index !== -1) {
            product.matchTags.splice(index, 1)
            removedCount++
        }
    }

    showSuccess(`Removed "${tagToRemove}" from ${removedCount} product(s)`)
}

// Manage tags for a specific product
async function manageProductTags(product: Product, allTags: string[]): Promise<boolean> {
    console.clear()
    console.log(
        `\n${colors.bright}${colors.blue}▶ MANAGE TAGS FOR: ${product.title}${colors.reset}\n`
    )
    console.log(`${colors.dim}Current tags: ${product.matchTags.length}${colors.reset}`)
    console.log(
        `${colors.dim}Press Space to toggle, Enter to confirm, Ctrl+C to cancel${colors.reset}\n`
    )

    // Create choices with current tags pre-checked
    const choices = allTags.map((tag) => ({
        name: tag,
        value: tag,
        checked: product.matchTags.includes(tag)
    }))

    const answer = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'selectedTags',
            message: 'Select tags for this product:',
            choices,
            pageSize: 25
        }
    ])

    const selectedTags = (answer.selectedTags as string[]).sort()

    // Check if tags changed
    const currentTags = [...product.matchTags].sort()
    const tagsChanged =
        selectedTags.length !== currentTags.length ||
        selectedTags.some((tag, index) => tag !== currentTags[index])

    if (!tagsChanged) {
        showInfo('No changes made')
        return false
    }

    // Show diff
    const added = selectedTags.filter((t) => !currentTags.includes(t))
    const removed = currentTags.filter((t) => !selectedTags.includes(t))

    console.log(`\n${colors.bright}Changes:${colors.reset}`)
    if (added.length > 0) {
        console.log(`  ${colors.green}+ Added: ${added.join(', ')}${colors.reset}`)
    }
    if (removed.length > 0) {
        console.log(`  ${colors.red}- Removed: ${removed.join(', ')}${colors.reset}`)
    }

    // Confirm changes
    const confirmAnswer = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Save these changes?',
            default: true
        }
    ])

    if (confirmAnswer.confirm) {
        product.matchTags = selectedTags
        return true
    }

    showInfo('Changes discarded')
    return false
}

// Add a new tag that doesn't exist yet
async function addNewTag(allTags: string[]): Promise<string | null> {
    const answer = await inquirer.prompt([
        {
            type: 'input',
            name: 'newTag',
            message: 'Enter new tag name (lowercase, hyphenated):',
            validate: (input: string) => {
                const tag = input.trim()
                if (!tag) return 'Tag name is required'
                if (!/^[a-z0-9-]+$/.test(tag)) {
                    return 'Tag should be lowercase with hyphens only (e.g., my-new-tag)'
                }
                if (allTags.includes(tag)) {
                    return `Tag "${tag}" already exists`
                }
                return true
            }
        }
    ])

    return answer.newTag.trim() || null
}

// Main interactive loop
async function main(): Promise<void> {
    showBanner()

    // Load products
    const productsData = loadProducts()
    const products = productsData.products

    showInfo(`Loaded ${products.length} products`)

    // Extract all unique tags at startup
    let allTags = getAllTags(products)
    showInfo(`Found ${allTags.length} unique tags\n`)

    let hasUnsavedChanges = false
    let running = true

    while (running) {
        showBanner()

        if (hasUnsavedChanges) {
            console.log(`${colors.yellow}⚠️  You have unsaved changes${colors.reset}\n`)
        }

        const selectedProduct = await selectProduct(products)

        if (!selectedProduct) {
            // User wants to exit
            if (hasUnsavedChanges) {
                const saveAnswer = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'save',
                        message: 'Save changes before exiting?',
                        default: true
                    }
                ])

                if (saveAnswer.save) {
                    saveProducts(productsData)
                    showSuccess('Changes saved!')
                }
            }
            running = false
            continue
        }

        // Handle special actions
        if (selectedProduct.id === '__continue__') {
            hasUnsavedChanges = true
            allTags = getAllTags(products) // Refresh tags
            continue
        }

        // Offer to add new tag before managing
        const actionAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: `Managing "${selectedProduct.title}":`,
                choices: [
                    { name: '🏷️ Toggle existing tags', value: 'toggle' },
                    { name: '➕ Add a new tag first', value: 'add' },
                    { name: '← Back to product list', value: 'back' }
                ]
            }
        ])

        if (actionAnswer.action === 'back') {
            continue
        }

        if (actionAnswer.action === 'add') {
            const newTag = await addNewTag(allTags)
            if (newTag) {
                allTags.push(newTag)
                allTags.sort()
                showSuccess(`Tag "${newTag}" added to available tags`)
            }
        }

        // Manage tags for selected product
        const changed = await manageProductTags(selectedProduct, allTags)

        if (changed) {
            hasUnsavedChanges = true
            allTags = getAllTags(products) // Refresh tags in case some were removed

            // Ask if user wants to save now
            const saveNowAnswer = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'saveNow',
                    message: 'Save changes now?',
                    default: false
                }
            ])

            if (saveNowAnswer.saveNow) {
                saveProducts(productsData)
                showSuccess('Changes saved!')
                hasUnsavedChanges = false
            }
        }
    }

    showGoodbye()
}

// Run
main().catch((error) => {
    if (error.name === 'ExitPromptError') {
        showGoodbye()
        process.exit(0)
    }
    showError(error instanceof Error ? error.message : String(error))
    process.exit(1)
})
