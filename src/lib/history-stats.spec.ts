import { describe, expect, test } from 'bun:test'
import { calculateHistoryStats } from './history-stats'
import type { Concept } from '@/types/concept'

// Helper to create minimal concept objects for testing
function createConcept(
    overrides: Partial<Concept> & { id: string; datePublished: string }
): Concept {
    return {
        name: overrides.name || overrides.id,
        summary: 'Test summary',
        explanation: 'Test explanation',
        tags: [],
        category: 'Concepts',
        featured: false,
        dateModified: overrides.datePublished,
        ...overrides
    }
}

describe('calculateHistoryStats', () => {
    describe('empty concepts', () => {
        test('returns zero stats for empty array', () => {
            const stats = calculateHistoryStats([])

            expect(stats.totalConcepts).toBe(0)
            expect(stats.uniqueDates).toBe(0)
            expect(stats.avgPerDay).toBe(0)
            expect(stats.conceptsByDate).toEqual([])
        })
    })

    describe('totalConcepts', () => {
        test('counts all concepts', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' }),
                createConcept({ id: 'c', datePublished: '2024-01-02' })
            ]

            const stats = calculateHistoryStats(concepts)
            expect(stats.totalConcepts).toBe(3)
        })
    })

    describe('uniqueDates', () => {
        test('counts unique publication dates', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' }),
                createConcept({ id: 'c', datePublished: '2024-01-02' }),
                createConcept({ id: 'd', datePublished: '2024-01-03' })
            ]

            const stats = calculateHistoryStats(concepts)
            expect(stats.uniqueDates).toBe(3)
        })

        test('returns 1 when all concepts on same date', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' })
            ]

            const stats = calculateHistoryStats(concepts)
            expect(stats.uniqueDates).toBe(1)
        })
    })

    describe('avgPerDay', () => {
        test('calculates correct average for single day', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' }),
                createConcept({ id: 'c', datePublished: '2024-01-01' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 3 concepts over 1 day = 3 per day
            expect(stats.avgPerDay).toBe(3)
        })

        test('calculates correct average for multiple days', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-02' }),
                createConcept({ id: 'c', datePublished: '2024-01-03' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 3 concepts over 3 days = 1 per day
            expect(stats.avgPerDay).toBe(1)
        })

        test('calculates average including days with no additions', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-05' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 2 concepts over 5 days (Jan 1 to Jan 5) = 0.4 per day
            expect(stats.avgPerDay).toBe(0.4)
        })

        test('handles large gaps between dates', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-11' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 2 concepts over 11 days = 2/11 ≈ 0.182
            expect(stats.avgPerDay).toBeCloseTo(2 / 11, 10)
        })

        test('handles many concepts over few days', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' }),
                createConcept({ id: 'c', datePublished: '2024-01-01' }),
                createConcept({ id: 'd', datePublished: '2024-01-02' }),
                createConcept({ id: 'e', datePublished: '2024-01-02' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 5 concepts over 2 days = 2.5 per day
            expect(stats.avgPerDay).toBe(2.5)
        })
    })

    describe('conceptsByDate', () => {
        test('groups concepts by date', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' }),
                createConcept({ id: 'c', datePublished: '2024-01-02' })
            ]

            const stats = calculateHistoryStats(concepts)
            expect(stats.conceptsByDate).toHaveLength(2)
            expect(stats.conceptsByDate[0]!.concepts).toHaveLength(1) // Jan 2 (newest first)
            expect(stats.conceptsByDate[1]!.concepts).toHaveLength(2) // Jan 1
        })

        test('sorts dates newest first', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2024-01-01' }),
                createConcept({ id: 'b', datePublished: '2024-01-03' }),
                createConcept({ id: 'c', datePublished: '2024-01-02' })
            ]

            const stats = calculateHistoryStats(concepts)
            expect(stats.conceptsByDate[0]!.date).toBe('2024-01-03')
            expect(stats.conceptsByDate[1]!.date).toBe('2024-01-02')
            expect(stats.conceptsByDate[2]!.date).toBe('2024-01-01')
        })

        test('sorts concepts alphabetically within each date', () => {
            const concepts = [
                createConcept({ id: 'zebra', name: 'Zebra', datePublished: '2024-01-01' }),
                createConcept({ id: 'alpha', name: 'Alpha', datePublished: '2024-01-01' }),
                createConcept({ id: 'beta', name: 'Beta', datePublished: '2024-01-01' })
            ]

            const stats = calculateHistoryStats(concepts)
            const names = stats.conceptsByDate[0]!.concepts.map((c) => c.name)
            expect(names).toEqual(['Alpha', 'Beta', 'Zebra'])
        })

        test('includes formatted date string', () => {
            const concepts = [createConcept({ id: 'a', datePublished: '2024-01-15' })]

            const stats = calculateHistoryStats(concepts)
            // The exact format depends on locale, but it should include the date components
            expect(stats.conceptsByDate[0]!.formattedDate).toContain('2024')
            expect(stats.conceptsByDate[0]!.formattedDate).toContain('15')
            expect(stats.conceptsByDate[0]!.formattedDate).toContain('January')
        })

        test('preserves original date string', () => {
            const concepts = [createConcept({ id: 'a', datePublished: '2024-06-15' })]

            const stats = calculateHistoryStats(concepts)
            expect(stats.conceptsByDate[0]!.date).toBe('2024-06-15')
        })
    })

    describe('edge cases', () => {
        test('handles single concept', () => {
            const concepts = [createConcept({ id: 'only', datePublished: '2024-01-01' })]

            const stats = calculateHistoryStats(concepts)
            expect(stats.totalConcepts).toBe(1)
            expect(stats.uniqueDates).toBe(1)
            expect(stats.avgPerDay).toBe(1)
            expect(stats.conceptsByDate).toHaveLength(1)
        })

        test('handles concepts spanning a full year', () => {
            const concepts = [
                createConcept({ id: 'start', datePublished: '2024-01-01' }),
                createConcept({ id: 'end', datePublished: '2024-12-31' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 366 days in 2024 (leap year)
            expect(stats.avgPerDay).toBeCloseTo(2 / 366, 10)
        })

        test('handles dates across year boundary', () => {
            const concepts = [
                createConcept({ id: 'a', datePublished: '2023-12-31' }),
                createConcept({ id: 'b', datePublished: '2024-01-01' })
            ]

            const stats = calculateHistoryStats(concepts)
            // 2 concepts over 2 days
            expect(stats.avgPerDay).toBe(1)
        })
    })
})
