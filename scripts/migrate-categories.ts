#!/usr/bin/env tsx

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Concept {
    id: string
    name: string
    category: string
    tags?: string[]
    [key: string]: any
}

interface MigrationRule {
    condition: (concept: Concept) => boolean
    newCategory: string
    priority: number
    reason: string
}

interface MigrationResult {
    conceptId: string
    oldCategory: string
    newCategory: string
    reason: string
    isEdgeCase: boolean
    edgeCaseReason?: string
}

interface CategoryStats {
    before: number
    after: number
    change: number
}

const CONCEPTS_DIR = path.join(__dirname, '../src/data/concepts')

// Migration rules in priority order
const migrationRules: MigrationRule[] = [
    // Priority 1: Fix cognitive biases miscategorization
    {
        condition: (concept) =>
            concept.tags?.includes('cognitive-biases') && concept.category !== 'Cognitive Biases',
        newCategory: 'Cognitive Biases',
        priority: 1,
        reason: 'Tagged as cognitive-biases but not in Cognitive Biases category'
    },

    // Priority 2: Consolidate micro-categories
    {
        condition: (concept) => concept.category === 'Clarity',
        newCategory: 'Writing & Content Creation',
        priority: 2,
        reason: 'Consolidating Clarity micro-category'
    },
    {
        condition: (concept) => concept.category === 'Products',
        newCategory: 'Tools',
        priority: 2,
        reason: 'Consolidating Products micro-category'
    },
    {
        condition: (concept) => concept.category === 'Core Concepts',
        newCategory: 'Principles',
        priority: 2,
        reason: 'Consolidating Core Concepts micro-category'
    },
    {
        condition: (concept) => concept.category === 'Processes',
        newCategory: 'Methods',
        priority: 2,
        reason: 'Consolidating Processes micro-category'
    },
    {
        condition: (concept) => concept.category === 'Note Types',
        newCategory: 'Methods',
        priority: 2,
        reason: 'Consolidating Note Types micro-category'
    },

    // Priority 3: New category migrations (only if still in generic "Concepts")
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('psychology') ||
                concept.tags?.includes('cognition') ||
                concept.tags?.includes('mental-models') ||
                concept.tags?.includes('neuroscience')),
        newCategory: 'Psychology & Mental Models',
        priority: 3,
        reason: 'Psychology/cognition/mental-models/neuroscience tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('philosophies') ||
                concept.tags?.includes('wisdom') ||
                concept.tags?.includes('stoicism') ||
                concept.tags?.includes('existentialism')),
        newCategory: 'Philosophy & Wisdom',
        priority: 3,
        reason: 'Philosophy/wisdom/stoicism/existentialism tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('well-being') ||
                concept.tags?.includes('happiness') ||
                concept.tags?.includes('mental-health') ||
                concept.tags?.includes('mindfulness') ||
                concept.tags?.includes('gratitude')),
        newCategory: 'Well-Being & Happiness',
        priority: 3,
        reason: 'Well-being/happiness/mental-health/mindfulness/gratitude tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('businesses') ||
                concept.tags?.includes('marketing') ||
                concept.tags?.includes('economics') ||
                concept.tags?.includes('entrepreneurship') ||
                concept.tags?.includes('sales')),
        newCategory: 'Business & Economics',
        priority: 3,
        reason: 'Business/marketing/economics/entrepreneurship/sales tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('decision-making') ||
                concept.tags?.includes('problem-solving')),
        newCategory: 'Decision Science',
        priority: 3,
        reason: 'Decision-making/problem-solving tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('leadership') ||
                concept.tags?.includes('organizations') ||
                concept.tags?.includes('management') ||
                concept.tags?.includes('teams')),
        newCategory: 'Leadership & Management',
        priority: 3,
        reason: 'Leadership/organizations/management/teams tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('learning') ||
                concept.tags?.includes('education') ||
                concept.tags?.includes('teaching') ||
                concept.tags?.includes('memories')),
        newCategory: 'Learning & Education',
        priority: 3,
        reason: 'Learning/education/teaching/memories tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('writing') || concept.tags?.includes('content-creation')),
        newCategory: 'Writing & Content Creation',
        priority: 3,
        reason: 'Writing/content-creation tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' &&
            (concept.tags?.includes('attention') || concept.tags?.includes('focus')),
        newCategory: 'Attention & Focus',
        priority: 3,
        reason: 'Attention/focus tag'
    },
    {
        condition: (concept) =>
            concept.category === 'Concepts' && concept.tags?.includes('communications'),
        newCategory: 'Communication',
        priority: 3,
        reason: 'Communications tag'
    }
]

// Detect edge cases (concepts that match multiple new categories)
function detectEdgeCases(concept: Concept): { isEdgeCase: boolean; reason?: string } {
    const matchingRules = migrationRules.filter(
        (rule) => rule.priority === 3 && rule.condition(concept)
    )

    if (matchingRules.length > 1) {
        const categories = matchingRules.map((r) => r.newCategory).join(', ')
        return {
            isEdgeCase: true,
            reason: `Matches multiple categories: ${categories}`
        }
    }

    return { isEdgeCase: false }
}

// Apply migration rules to a concept
function migrateConcept(concept: Concept): MigrationResult | null {
    const originalCategory = concept.category

    // Find the first matching rule (sorted by priority)
    const matchingRule = migrationRules
        .sort((a, b) => a.priority - b.priority)
        .find((rule) => rule.condition(concept))

    if (!matchingRule) {
        return null // No migration needed
    }

    const edgeCase = detectEdgeCases(concept)

    return {
        conceptId: concept.id,
        oldCategory: originalCategory,
        newCategory: matchingRule.newCategory,
        reason: matchingRule.reason,
        isEdgeCase: edgeCase.isEdgeCase,
        edgeCaseReason: edgeCase.reason
    }
}

// Main migration function
async function runMigration(dryRun: boolean = false): Promise<void> {
    console.log('🚀 Starting category migration...\n')
    console.log(
        `Mode: ${dryRun ? 'DRY RUN (no files will be modified)' : 'LIVE (files will be updated)'}\n`
    )

    const files = fs.readdirSync(CONCEPTS_DIR).filter((f) => f.endsWith('.json'))
    const results: MigrationResult[] = []
    const categoryStats: Record<string, CategoryStats> = {}
    const edgeCases: MigrationResult[] = []

    // Count categories before migration
    const categoriesBeforeMigration: Record<string, number> = {}
    for (const file of files) {
        const filePath = path.join(CONCEPTS_DIR, file)
        const concept: Concept = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        categoriesBeforeMigration[concept.category] =
            (categoriesBeforeMigration[concept.category] || 0) + 1
    }

    // Process each concept
    let modifiedCount = 0
    for (const file of files) {
        const filePath = path.join(CONCEPTS_DIR, file)
        const concept: Concept = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

        const result = migrateConcept(concept)

        if (result) {
            results.push(result)

            if (result.isEdgeCase) {
                edgeCases.push(result)
            }

            // Update concept category
            concept.category = result.newCategory

            // Write updated concept (unless dry run)
            if (!dryRun) {
                fs.writeFileSync(filePath, JSON.stringify(concept, null, 4) + '\n', 'utf-8')
                modifiedCount++
            }
        }
    }

    // Count categories after migration
    const categoriesAfterMigration: Record<string, number> = {}
    if (!dryRun) {
        for (const file of files) {
            const filePath = path.join(CONCEPTS_DIR, file)
            const concept: Concept = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            categoriesAfterMigration[concept.category] =
                (categoriesAfterMigration[concept.category] || 0) + 1
        }
    } else {
        // Simulate after-migration counts for dry run
        for (const category in categoriesBeforeMigration) {
            categoriesAfterMigration[category] = categoriesBeforeMigration[category]
        }
        for (const result of results) {
            categoriesAfterMigration[result.oldCategory] =
                (categoriesAfterMigration[result.oldCategory] || 0) - 1
            categoriesAfterMigration[result.newCategory] =
                (categoriesAfterMigration[result.newCategory] || 0) + 1
        }
    }

    // Calculate stats
    const allCategories = new Set([
        ...Object.keys(categoriesBeforeMigration),
        ...Object.keys(categoriesAfterMigration)
    ])

    for (const category of allCategories) {
        const before = categoriesBeforeMigration[category] || 0
        const after = categoriesAfterMigration[category] || 0
        categoryStats[category] = {
            before,
            after,
            change: after - before
        }
    }

    // Print report
    console.log('═'.repeat(80))
    console.log('MIGRATION REPORT')
    console.log('═'.repeat(80))
    console.log(`\nTotal concepts processed: ${files.length}`)
    console.log(`Concepts modified: ${results.length}`)
    console.log(`Edge cases flagged for review: ${edgeCases.length}\n`)

    console.log('Changes by category:')
    console.log('─'.repeat(80))

    // Sort categories by change magnitude
    const sortedCategories = Object.entries(categoryStats).sort(
        (a, b) => Math.abs(b[1].change) - Math.abs(a[1].change)
    )

    for (const [category, stats] of sortedCategories) {
        if (stats.change !== 0) {
            const changeStr = stats.change > 0 ? `+${stats.change}` : `${stats.change}`
            const changeEmoji = stats.change > 0 ? '📈' : '📉'
            console.log(
                `  ${changeEmoji} ${category}: ${stats.before} → ${stats.after} (${changeStr})`
            )
        }
    }

    console.log('\n' + '─'.repeat(80))
    console.log('\nMicro-category consolidations:')
    const microCategories = ['Clarity', 'Products', 'Core Concepts', 'Processes', 'Note Types']
    for (const category of microCategories) {
        const stats = categoryStats[category]
        if (stats) {
            const target = results.find((r) => r.oldCategory === category)?.newCategory || 'Unknown'
            console.log(`  • ${category} (${stats.before}) → ${target}`)
        }
    }

    if (edgeCases.length > 0) {
        console.log('\n' + '─'.repeat(80))
        console.log('\n⚠️  Edge cases for manual review:')
        for (const edge of edgeCases) {
            console.log(`  • ${edge.conceptId}: ${edge.edgeCaseReason}`)
            console.log(`    → Would migrate from "${edge.oldCategory}" to "${edge.newCategory}"`)
        }
    }

    console.log('\n' + '═'.repeat(80))

    if (dryRun) {
        console.log('\n✓ Dry run complete - no files were modified')
        console.log('  Run again with --apply flag to apply changes\n')
    } else {
        console.log(`\n✓ Migration complete - ${modifiedCount} files modified\n`)
    }
}

// Parse command line arguments
const args = process.argv.slice(2)
const dryRun = !args.includes('--apply')

runMigration(dryRun).catch((err) => {
    console.error('Error during migration:', err)
    process.exit(1)
})
